import { elementLineLength } from "element-line-length";

const stopTrackingMouse = trackMouse();
whenEscape(stopTrackingMouse);

/**
 * @param {() => void} callback
 */
function whenEscape(callback) {
  /**
   * @param {KeyboardEvent} event
   */
  const keyHandler = (event) => {
    if (event.key === 'Escape') {
      document.removeEventListener('keydown', keyHandler);
      callback();
    }
  };

  document.addEventListener('keydown', keyHandler);
}

/**
 *
 * @returns {() => void} Clean up function
 */
function trackMouse() {
  const removeGlobalStyles = createGlobalStyles();
  let infoCard = null;

  // css selectors of elements that will not be checked
  const ignorables = ['body', 'html'];

  /**
   * @param {MouseEvent} event
   */
  const onMouseOver = event => {
    const target = event.target;
    if (ignorables.some(selector => target.matches(selector))) {
      return;
    }

    // Mark current element
    target.dataset.lineLengthSubject = '';

    const stats = computeStats(elementLineLength(target));
    infoCard = infoCard || createInfoCard();
    infoCard.update(target, stats);
    infoCard.moveTo(event.clientX, event.clientY);
  };

  /**
   * @param {MouseEvent} event
   */
  const onMouseOut = event => {
    // Unmark element
    delete event.target.dataset.lineLengthSubject;
  };

  /**
   * @param {MouseEvent} event
   */
  const onMouseMove = event => {
    if (infoCard) {
      infoCard.moveTo(event.clientX, event.clientY);
    }
  };

  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseout', onMouseOut);

  return () => {
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseout', onMouseOut);

    if (infoCard) {
      infoCard.destroy();
      removeGlobalStyles();
    }
  };
}

function createGlobalStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `[data-line-length-subject] { outline: 3px dotted #E7040F !important; }`;

  document.body.appendChild(styleElement);

  return () => styleElement.remove();
}

function createInfoCard() {
  const cardElement = document.createElement('div');
  cardElement.style.cssText = `
color: #111;
background-color: #fff;
border: 2px solid #111;
border-radius: 0.5rem;
box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
margin: 0;
padding: 0.8rem;
position: fixed;
z-index: 10;
max-width: 20rem;
font-family: Consolas, monaco, monospace;
font-size: 1rem;
line-height: 1.5;
text-align: start;
`;

  document.body.appendChild(cardElement);

  return {
    /**
     * @param {number} viewportX
     * @param {number} viewportY
     */
    moveTo(viewportX, viewportY) {
      cardElement.style.left = `${viewportX}px`;

      const yOffset = 10;
      cardElement.style.top = `${viewportY + yOffset}px`;
    },
    /**
     * @param {HTMLElement} element
     * @param {Stats | null} stats
     */
    update(element, stats) {
      const elementInfo = [
        '<span>',
        `<span style="color: #5E2CA5;">${element.nodeName.toLowerCase()}</span>`,
        element.id ? `<span style="color: #137752">#${element.id}</span>` : '',
        element.classList.length ? `<span style="color: #E7040F;">.${Array.from(element.classList).join('.')}</span>` : '',
        '</span>',
      ].join('')

      const charCountInfo = stats == null
        ? '<div style="margin: inherit; line-height: inherit;">No text found</div>'
        : `<div style="margin: inherit; line-height: inherit;">Median: ${stats.median}</div>
<div style="margin: inherit; line-height: inherit;">Max: ${stats.max}</div>`;

      cardElement.innerHTML = `
<div style="overflow-x: clip;white-space: nowrap;text-overflow: ellipsis;padding: 0 0 0.8rem 0; margin: 0 0 0.8rem 0; border-bottom: 1px solid #d3d3d3;">${elementInfo}</div>
${charCountInfo}
<div style="color: dimgray; font-size: 0.8rem; margin: 0.8rem 0 0 0; text-align: center;">Esc to close</div>`;
    },
    destroy() {
      cardElement.remove();
    },
  };
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
