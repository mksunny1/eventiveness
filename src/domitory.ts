/**
 * A function used to insert a new node using a target node.
 *
 * @example
 * myInserter = (node, target) => target.append(node);
 */
export interface Inserter {
  (node: Node, target: Node): void;
}

/**
 * Insert the values before the elements.
 *
 * @example
 * // Insert a span into all the children of the first main element:
 * import {apply} from 'appliance'
 * import {insert} from 'domitory'
 * const span = document.createElement('span');
 * apply({main: main => insert(main.children, main.children.map(() => span.cloneNode())))})
 *
 *
 * @param {Iterable<Node>} elements The target nodes.
 * @param {Iterable<Node>} values The new nodes to insert.
 * @param {Inserter} [insertWith] The insertion function
 */
export function insert(
  elements: Iterator<Node> | Node[],
  values: Iterable<Node>,
  insertWith?: Inserter,
) {
  if (elements instanceof Array) elements = elements.values();
  if (values instanceof HTMLCollection || values instanceof NodeList)
    values = Array.from(values);
  if (!insertWith) insertWith = inserter.append; // the default inserter
  for (let value of values) insertWith(value, elements.next().value);
}

/**
 * Default inserters for use with `insert`
 */
export const inserter = {
  /**
   * Inserts the node before the target using `insertBefore`
   * @param node
   * @param target
   */
  before(node: Node, target: Node) {
    target.parentNode?.insertBefore(node, target);
  },
  /**
   * Append the node to the target using `appendChild`
   * @param node
   * @param target
   */
  append(node: Node, target: Node) {
    target.appendChild(node);
  },
};

/**
 * Creates a DocumentRange between the start and end elements
 *
 * @example
 *
 *
 * @param {Node} start The first element in the range
 * @param {Node} end  The last element in the range
 * @returns {Range}
 */
export function createRange(start: Node, end: Node): Range {
  const range = document.createRange();
  range.setStart(start, 0);
  range.setStart(end, 0);
  return range;
}

/**
 * Map of string keys to any[] values. The keys name properties
 * (or attributes when they start with _) and the values are arrays
 * matched against selected or specified elements .
 *
 * As an example, we can target 3 buttons to set their
 * textContents to corresponding values using the following SetOnMap
 * (as the values object in a call to `setOn`):
 * @example
 * {
 *     textContent: ['btn 1', 'btn 2', 'btn 3']
 * },
 */
export interface SetMap {
  [key: string]: any[];
}

/**
 * Set specified properties and/or attributes on the specified elements.
 * Please do not pass the same 'generator' multiple times in values. First
 * convert them to arrays.
 *
 * @example
 * // Shuffle the class attributes of all the children of the first main element:
 * import {apply} from 'appliance'
 * import {set} from 'domitory'
 * import {uItems} from 'generational'
 * apply({main: main => set(main.children, {_class: uItems(main.children.map(c => c.className))})})
 *
 *
 * @param {(Element|CSSRule)[]} elements
 * @param {SetMap} values
 */
export function set(elements: Iterable<Element | CSSRule>, values: SetMap) {
  const localMemberValues = new Set();
  for (let memberValues of Object.values(values)) {
    if (
      !(memberValues instanceof Array) &&
      localMemberValues.has(memberValues)
    ) {
      throw new Error(
        'set: You have passed the same generator multiple times in "values". Your intention is not clear. Aborting.',
      );
    } else if (!(memberValues instanceof Array))
      localMemberValues.add(memberValues);
  }

  if (!(elements instanceof Array)) elements = Array.from(elements);
  // we must materialize this first.

  let i = 0,
    memberValue: any;
  for (let [member, memberValues] of Object.entries(values)) {
    i = 0;
    if (member.startsWith("_")) {
      member = member.slice(1);
      for (memberValue of memberValues) {
        (elements[i++] as Element).setAttribute(member, memberValue as string);
      }
    } else {
      for (memberValue of memberValues) {
        elements[i++][member] = memberValue;
      }
    }
    i++;
  }
}

/**
 * Correctly replace the specified nodes with corresponding values.
 *
 * @example
 * // Safely shuffle all the children of the first main element:
 * import {apply} from 'appliance'
 * import {update} from 'domitory'
 * import {uItems} from 'generational'
 * apply({main: main => update(main.children, uItems(main.children))})
 *
 * @param {Iterable<Node>} elements The nodes to replace.
 * @param {Iterable<Node>} values The replacement nodes.
 */
export function update(elements: Iterable<Node>, values: Iterable<Node>) {
  let parentNode: Node | null, tempNode: Node;
  const template = document.createComment(""); // document.createElement('template');
  const temps: [Node, Node | null][] = [];

  if (values instanceof HTMLCollection || values instanceof NodeList)
    values = Array.from(values);

  for (let element of elements) {
    parentNode = element.parentElement;
    tempNode = template.cloneNode(false);
    parentNode?.replaceChild(tempNode, element);
    temps.push([tempNode, parentNode]);
  }

  /* at this point we have replaced what we want to replace with temporary values */
  let i = 0;
  for (let value of values) {
    [tempNode, parentNode] = temps[i++];
    parentNode?.replaceChild(value, tempNode);
  }
}

/**
 * Remove the elements from their parent nodes.
 *
 * @example
 * // Remove all elements with the 'rem' class
 * apply({'.rem': (...elements) => remove(elements)});
 *
 * @param {Iterable<Node>} elements
 */
export function remove(elements: Iterable<Node>) {
  for (let element of elements) {
    element.parentNode?.removeChild(element);
  }
}
