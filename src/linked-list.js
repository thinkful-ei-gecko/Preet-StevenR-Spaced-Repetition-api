'use strict';

class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }

  insertLast(item) {
    if (this.head === null) {
      this.insertFirst(item);
    } else {
      let tempNode = this.head;
      while (tempNode.next !== null) {
        tempNode = tempNode.next;
      }
      tempNode.next = new _Node(item, null);
    }
  }

  find(item) {
    let currNode = this.head;// Start at head
    if (!this.head) {
      return null;
    }
    while (currNode.value !== item) {// Check for item
      /* Return null if end of the list 
         and item is not on the list */
      if (currNode.next === null) {
        return null;
      } else {
        currNode = currNode.next;
      }
    }
    return currNode;
  }

  remove(item) {
    if (!this.head) {    // If the list is empty
      return null;
    }
    // If the node to be removed is head, make the next node head
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    let currNode = this.head; // Start at the head
    let previousNode = this.head; // Keep track of previous

    while (currNode !== null && currNode.value !== item) {
      previousNode = currNode;// Save the previous node
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('Item not found');
      return;
    }
    previousNode.next = currNode.next;
  }

  insertBefore(newValue, beforeTarget) {
    if (!this.head) {
      this.insertFirst(newValue);
    }
    let currNode = this.head;
    let previousNode = this.head;

    while (currNode !== null && currNode.value !== beforeTarget) {
      previousNode = currNode; // Save the previous node
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log('Target not found');
      return;
    }
    previousNode.next = new _Node(newValue, previousNode.next);
  }

  insertAfter(newValue, afterTarget) {
    if (!this.head) {
      this.insertFirst(newValue);
    }
    let currNode = this.head;
    while (currNode.next !== null && currNode.value !== afterTarget) {
      currNode = currNode.next;
    }
    if (currNode.next === null) {
      console.log('Target not found');
      return;
    }
    let newNode = new _Node(newValue, currNode.next);
    currNode.next = newNode;
  }
  
  insertAt(newValue, position) {
    let count = 1;
    let currNode = this.head;
    while (count < position) {
      if (currNode.next === null) {
        console.log('Could not find that position');
        return;
      }
      count++;
      currNode = currNode.next;
    }
    currNode.next = new _Node(newValue, currNode.next);
  }
}

function toArray(linkedList) {
  let currentNode = linkedList.head;
  let result = [];
  while (currentNode.next !== null) {
    result.push(currentNode.value);
    currentNode = currentNode.next;
  }
  result.push(currentNode.value);
  return result;
}

module.exports = {LinkedList, toArray, _Node}