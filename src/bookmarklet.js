import { splitTextNodes } from "split-text-nodes";

activate(document);

/**
 * @param {Document} document
 */
function activate(document) {
  const infoCard = createInfoCard();

  function createInfoCard() {
    const cardElement = document.createElement('div');
    cardElement.style.cssText = `
color: #111;
background-color: #fff;
border: 2px solid #111;
border-radius: 0.5rem;
box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
display: none;
font-size: 1rem;
font-family: Consolas, monaco, monospace;
padding: 0.8rem;
position: fixed;
z-index: 1;
max-width: 20rem;
`;

    document.body.appendChild(cardElement);

    return {
      hide() {
        cardElement.style.display = 'none';
      },
      show() {
        cardElement.style.display = 'block';
      },
      /**
       * @param {number} viewportX
       * @param {number} viewportY
       */
      moveTo(viewportX, viewportY) {
        cardElement.style.left = `${viewportX}px`;

        const yOffset = 10;
        cardElement.style.top = `${viewportY + yOffset}px`;
      },
      clear() {
        cardElement.innerHTML = '';
      },
      /**
       * @param {HTMLElement} element - The element we're showing stats for
       * @param {Stats} stats
       */
      update(element, stats) {
        cardElement.innerHTML = `
<div style="overflow-x: clip;white-space: nowrap;text-overflow: ellipsis;padding-bottom: 0.8rem; margin-bottom: 0.8rem; border-bottom: 1px solid lightgray;">${elementInfo(element)}</div>
<div>Median: ${stats.median}</div>
<div>Max: ${stats.max}</div>
<div style="color: dimgray; font-size: 0.8rem; margin-top: 0.8rem; text-align: center;">Esc to close</div>
`;
      },
      destroy() {
        cardElement.remove();
      },
    };
  }

  /**
   * @param {HTMLElement} element
   * @returns {string} html
   */
  function elementInfo(element) {
    return [
      '<span>',
      `<span style="color: #5E2CA5;">${element.nodeName.toLowerCase()}</span>`,
      element.id ? `<span style="color: #137752">#${element.id}</span>` : '',
      element.classList.length ? `<span style="color: #E7040F;">.${Array.from(element.classList).join('.')}</span>` : '',
      '</span>',
    ].join('');
  }

  /**
   * @param {MouseEvent} event
   */
  function onMouseOver(event) {
    const target = event.target;

    if (target instanceof HTMLElement) {
      const stats = computeStats(lineLengths(target));
      if (stats) {
        infoCard.update(target, stats);
        infoCard.moveTo(event.clientX, event.clientY);
        infoCard.show();
      }
    }
  }

  function onMouseOut() {
    infoCard.hide();
  }

  /**
   * @param {MouseEvent} event
   */
  function onMouseMove(event) {
    infoCard.moveTo(event.clientX, event.clientY);
  }

  /**
   * @param {KeyboardEvent} event
   */
  function onKeyDown(event) {
    if (event.key === 'Escape') {
      tearDown();
    }
  }

  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('keydown', onKeyDown);

  function tearDown() {
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('keydown', onKeyDown);

    infoCard.destroy();
  }

  return () => tearDown();
}

/**
 * @typedef {Object} Stats
 * @property {number} max
 * @property {number} median
 */

/**
 *
 * @param {Array<number>} lengths
 * @returns {Stats | null}
 */
function computeStats(lengths) {
  return lengths.length > 0
    ? {
      max: Math.max(...lengths),
      median: median(lengths),
    } : null;
}

function median(lengths) {
  const sortedLengths = lengths.slice().sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedLengths.length / 2);

  return sortedLengths.length % 2 !== 0
    // odd length, return middle item
    ? sortedLengths[middleIndex]
    // even length, return mean of the 2 middle items
    : (sortedLengths[middleIndex - 1] + sortedLengths[middleIndex]) / 2;
}

/**
 * @param {HTMLElement} element
 * @returns {Array<number>}
 */
function lineLengths(element) {
  const wrapperClass = 'll-wrap';

  // Put wrapper elements around words and whitespace
  const revert = splitTextNodes(element, {
    wrap(chunk) {
      const el = document.createElement('span');
      el.classList.add(wrapperClass);
      el.textContent = chunk;
      return el;
    }
  });

  // Group wrapper elements by line
  const wrappersByLine = new Map();
  for (const wrapper of element.querySelectorAll(`.${wrapperClass}`)) {
    const { top } = wrapper.getBoundingClientRect();

    if (wrappersByLine.has(top)) {
      wrappersByLine.get(top).push(wrapper);
    } else {
      wrappersByLine.set(top, [wrapper]);
    }
  }

  // Count characters per line
  const lengths = Array.from(wrappersByLine.values(), wrappers =>
    wrappers.reduce((total, wrapper) =>
      total + (wrapper.textContent || '').length, 0)
  );

  revert();

  return lengths;
}
