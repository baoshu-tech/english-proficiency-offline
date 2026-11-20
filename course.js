/* 线下版课程资料使用原站的卡片、切换按钮和进度图。 */
(() => {
  const byId = id => document.getElementById(id);

  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }

  function facts(className, entries) {
    const list = node('dl', undefined, className);
    for (const [label, value] of entries) {
      const row = node('div');
      row.append(node('dt', label), node('dd', value));
      list.append(row);
    }
    return list;
  }

  function setupChoices(group, items, label, panel, render) {
    const buttons = items.map((item, index) => {
      const button = node('button', label(item, index));
      button.type = 'button';
      button.setAttribute('aria-controls', panel.id);
      button.addEventListener('click', () => {
        for (const choice of buttons) {
          choice.setAttribute('aria-pressed', String(choice === button));
          if (group.id === 'ages') choice.classList.toggle('age-selected', choice === button);
        }
        render(item, index, panel);
      });
      return button;
    });
    group.replaceChildren(...buttons);
    group.addEventListener('keydown', event => {
      const current = buttons.indexOf(document.activeElement);
      if (current < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = current;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = buttons.length - 1;
      if (event.key === 'ArrowLeft') next = (current - 1 + buttons.length) % buttons.length;
      if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
      buttons[next].focus();
      buttons[next].click();
    });
    buttons[0].click();
  }

  function describeAge(age, index, panel) {
    const summary = node('div', undefined, 'age-summary');
    const indicators = [
      ['阶段标准', age.standard], ['对应水平', age.school],
      ['词汇量', age.vocab], ['蓝思值', age.lexile]
    ];
    for (const [label, value] of indicators) {
      const item = node('div');
      item.append(node('span', label), node('strong', value));
      summary.append(item);
    }
    const columns = node('div', undefined, 'grid two');
    for (const [title, lines] of [['学什么', age.learn], ['怎么学', age.practice]]) {
      const card = node('article', undefined, 'card');
      const list = node('ul');
      list.append(...lines.map(line => node('li', line)));
      card.append(node('h3', title), list);
      columns.append(card);
    }
    panel.replaceChildren(node('h3', age.age + ' · ' + age.stage), summary, columns);
  }

  function describeLevel(level, index, panel) {
    const heading = node('div', undefined, 'spaced');
    const title = index === 5 ? level.name + '（衔接雅思）' : level.name;
    heading.append(node('h2', title), node('span', '能力 ' + (index + 1) + ' 级', 'tag'));
    const summary = facts('course-facts', [
      ['入学门槛', '词汇量 ' + level.entry], ['学完词汇', level.completedVocabulary]
    ]);
    const table = node('table', undefined, 'level-table');
    const header = table.createTHead().insertRow();
    for (const label of ['项目', '内容']) {
      const cell = node('th', label);
      cell.scope = 'col';
      header.append(cell);
    }
    const body = table.createTBody();
    for (const [label, value] of level.details) {
      const cell = node('th', label);
      cell.scope = 'row';
      body.insertRow().append(cell, node('td', value));
    }
    panel.replaceChildren(heading, summary, table);
  }

  setupChoices(byId('ages'), ages, age => age.age, byId('agePanel'), describeAge);
  setupChoices(byId('levels'), levels, (_, i) => '能力 ' + (i + 1) + ' 级', byId('levelPanel'), describeLevel);

  const stageRail = byId('stage-carousel');
  stageRail.replaceChildren(...learningStages.map((stage, index) => {
    const slide = node('article', undefined, 'card stage-slide');
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', '第 ' + (index + 1) + ' 组，共 ' + learningStages.length + ' 组');
    const summary = node('div', undefined, 'stage-summary');
    const standard = node('dd', undefined, 'stage-standard');
    standard.append(...stage.standard.map(text => node('span', text)));
    const goals = node('dl');
    goals.append(node('dt', '阶段标准'), standard, node('dt', '对应英语水平'), node('dd', stage.benchmark));
    summary.append(
      node('h3', stage.title), node('h4', '目标'), goals,
      node('h4', '词汇量/蓝思值'), node('p', stage.vocabulary), node('p', stage.lexile)
    );
    slide.append(summary);
    for (const [heading, content] of [['学什么', stage.learning], ['怎么学', stage.practice]]) {
      const column = node('div', undefined, 'stage-detail');
      column.append(node('h4', heading), ...content.map(line => node('p', line)));
      slide.append(column);
    }
    return slide;
  }));

  const feeRows = byId('fee-standard').querySelector('tbody');
  const feeCards = byId('fee-standard').querySelector('.mobile-fee-cards');
  for (const [index, level] of levels.entries()) {
    const { hours, unitPrice, months, track } = level.plan;
    const label = '能力 ' + (index + 1) + ' 级';
    const price = '¥' + (hours * unitPrice).toLocaleString('en-US');
    const trackName = level.specialty ? track + '（' + level.specialty + '）' : track;
    const entries = [
      ['课时', hours + ' 课时'], ['单价', unitPrice + ' 元/课时'],
      ['完成周期', '约 ' + months + ' 个月'], ['课程主线', trackName]
    ];
    const row = node('tr');
    const titleCell = node('th', label);
    titleCell.scope = 'row';
    row.append(titleCell, ...[entries[0][1], entries[1][1], price, entries[2][1], trackName].map(value => node('td', value)));
    feeRows.append(row);
    const card = node('article', undefined, 'card mobile-fee-card');
    card.style.setProperty('--flip-order', index);
    card.append(node('h3', label), node('strong', price, 'mobile-fee-price'), facts('', entries));
    feeCards.append(card);
  }

  const progress = byId('course-progress');
  const chart = progress.querySelector('.progress-chart');
  const dots = progress.querySelector('.progress-nodes');
  const picker = progress.querySelector('.progress-picker');
  const detail = progress.querySelector('.progress-detail');
  const fill = chart.querySelector('.progress-fill');
  const track = chart.querySelector('.progress-track');
  const connector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  connector.setAttribute('class', 'curve-info-link');
  chart.querySelector('svg').append(connector);

  // The horizontal distance between level endpoints follows the period of that level.
  const intervalMonths = levels.slice(1).reduce((sum, level) => sum + level.plan.months, 0);
  let elapsed = 0;
  let path = '';
  const points = levels.map((level, i) => {
    if (i) elapsed += level.plan.months;
    return { x: 35 + 590 * elapsed / intervalMonths, y: [310, 280, 245, 210, 175, 130][i] };
  });
  const nodeLengths = points.map((point, i) => {
    if (i === 0) {
      path = 'M ' + point.x + ' ' + point.y;
    } else {
      const previous = points[i - 1];
      const middle = (previous.x + point.x) / 2;
      path += ' C ' + middle + ' ' + previous.y + ' ' + middle + ' ' + point.y + ' ' + point.x + ' ' + point.y;
    }
    track.setAttribute('d', path);
    return i ? track.getTotalLength() : 0;
  });
  fill.setAttribute('d', path);
  const fullLength = nodeLengths[nodeLengths.length - 1];
  let selected = 0;
  let timer = 0;
  let manualSelection = false;
  let chartVisible = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function selectLevel(index) {
    selected = index;
    const level = levels[index];
    const point = points[index];
    [...dots.children].forEach((dot, i) => {
      dot.classList.toggle('reached', i <= index);
      dot.setAttribute('aria-pressed', String(i === index));
      picker.children[i].setAttribute('aria-pressed', String(i === index));
    });
    chart.dataset.level = String(index + 1);
    fill.style.strokeDashoffset = String(100 - 100 * nodeLengths[index] / fullLength);
    connector.setAttribute('d', 'M ' + point.x + ' ' + point.y + ' v -35');
    const heading = node('div', undefined, 'progress-detail-top');
    heading.append(node('h3', '能力 ' + (index + 1) + ' 级 · ' + level.name));
    detail.replaceChildren(heading, facts('', [
      ['课程课时', level.plan.hours + ' 课时'], ['词汇量进展', level.entry + ' → ' + level.target],
      ['本级周期', '约 ' + level.plan.months + ' 个月'], ['能力出口', level.goal]
    ]));
    detail.classList.remove('info-arrive');
    void detail.offsetWidth;
    detail.classList.add('info-arrive');
  }

  points.forEach((point, index) => {
    const label = '能力 ' + (index + 1) + ' 级';
    const dot = node('button', String(index + 1), 'progress-node');
    dot.setAttribute('aria-label', label);
    dot.style.left = (point.x / 660 * 100) + '%';
    dot.style.top = (point.y / 360 * 100) + '%';
    const button = node('button', label);
    for (const control of [dot, button]) {
      control.type = 'button';
      control.addEventListener('click', () => {
        manualSelection = true;
        clearTimeout(timer);
        selectLevel(index);
      });
    }
    dots.append(dot);
    picker.append(button);
  });

  function scheduleNext() {
    clearTimeout(timer);
    if (!chartVisible || document.hidden || manualSelection || reducedMotion.matches || selected >= levels.length - 1) return;
    timer = setTimeout(() => {
      selectLevel(selected + 1);
      scheduleNext();
    }, 2400);
  }

  selectLevel(0);
  new IntersectionObserver(([entry]) => {
    chartVisible = entry.isIntersecting;
    scheduleNext();
  }, { threshold: 0.2 }).observe(chart);
  document.addEventListener('visibilitychange', scheduleNext);
  reducedMotion.addEventListener('change', scheduleNext);
})();
