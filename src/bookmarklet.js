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
  let infoCard = null;

  // css selectors of elements that will not be checked
  const ignoreList = ['body', 'html'];

  /**
   * @param {MouseEvent} event
   */
  const onMouseOver = event => {
    const target = event.target;
    if (ignoreList.some(selector => target.matches(selector))) {
      return;
    }

    const stats = computeStats(elementLineLength(target));

    if (stats) {
      infoCard = infoCard || createInfoCard();
      infoCard.update(target, stats);
      infoCard.moveTo(event.clientX, event.clientY);
    }
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

  return () => {
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mousemove', onMouseMove);

    if (infoCard) {
      infoCard.destroy();
    }
  };
}

function createInfoCard() {
  const cardElement = document.createElement('div');
  cardElement.style.cssText = `
color: #111;
background-color: #fff;
border: 2px solid #111;
border-radius: 0.5rem;
box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
padding: 0.8rem;
position: fixed;
z-index: 1;
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
     * @param {Stats} stats
     */
    update(element, stats) {
      const elementInfo = [
        '<span>',
        `<span style="color: #5E2CA5;">${element.nodeName.toLowerCase()}</span>`,
        element.id ? `<span style="color: #137752">#${element.id}</span>` : '',
        element.classList.length ? `<span style="color: #E7040F;">.${Array.from(element.classList).join('.')}</span>` : '',
        '</span>',
      ].join('')

      cardElement.innerHTML = `
<div style="overflow-x: clip;white-space: nowrap;text-overflow: ellipsis;padding-bottom: 0.8rem; margin-bottom: 0.8rem; border-bottom: 1px solid #d3d3d3;">${elementInfo}</div>
<div>Median: ${stats.median}</div>
<div>Max: ${stats.max}</div>
<div style="color: dimgray; font-size: 0.8rem; margin-top: 0.8rem; text-align: center;">Esc to close</div>`;
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
