import { elementLineLength } from "element-line-length";

let floatingInfoCard = null;

const stopTrackingMouse = trackMouse(
  function onMouseOver(event) {
    const target = event.target;

    if (target instanceof HTMLElement) {
      const stats = computeStats(elementLineLength(target));
      if (stats) {
        floatingInfoCard = createInfoCard(target, stats);
        floatingInfoCard.moveTo(event.clientX, event.clientY);
      }
    }
  },
  function onMouseOut() {
    if (floatingInfoCard) {
      floatingInfoCard.destroy();
    }
    floatingInfoCard = null;
  },
  function onMouseMove(event) {
    if (floatingInfoCard) {
      floatingInfoCard.moveTo(event.clientX, event.clientY);
    }
  }
);

document.addEventListener('keydown', offWhenEscape);

/**
 * @param {HTMLElement} element
 * @param {Stats} stats
 */
function createInfoCard(element, stats) {
  const cardElement = document.createElement('div');
  cardElement.style.cssText = `
color: #111;
background-color: #fff;
border: 2px solid #111;
border-radius: 0.5rem;
box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
font-size: 1rem;
font-family: Consolas, monaco, monospace;
padding: 0.8rem;
position: fixed;
z-index: 1;
max-width: 20rem;
`;

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
<div style="color: dimgray; font-size: 0.8rem; margin-top: 0.8rem; text-align: center;">Esc to close</div>
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
    destroy() {
      cardElement.remove();
    },
  };
}

/**
 * @param {KeyboardEvent} event
 */
function offWhenEscape(event) {
  if (event.key === 'Escape') {
    document.removeEventListener('keydown', offWhenEscape);

    stopTrackingMouse();

    if (floatingInfoCard) {
      floatingInfoCard.destroy();
    }
    floatingInfoCard = null;
   }
}

/**
 * @param {(e: MouseEvent) => void} onMouseOver
 * @param {(e: MouseEvent) => void} onMouseOut
 * @param {(e: MouseEvent) => void} onMouseMove
 * @returns {() => void} clean up function
 */
function trackMouse(onMouseOver, onMouseOut, onMouseMove) {
  document.addEventListener('mouseover', onMouseOver);
  document.addEventListener('mouseout', onMouseOut);
  document.addEventListener('mousemove', onMouseMove);

  return () => {
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
    document.removeEventListener('mousemove', onMouseMove);
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
