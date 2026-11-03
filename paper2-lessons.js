/* Original TechDojo Paper 2 exercises. Pseudocode is reviewed, never executed. */
window.TDPaper2Lessons = [
  {
    "id": "total",
    "title": "01 · Total the readings",
    "topic": "2.2.1",
    "kind": "Write a function",
    "prompt": "Write total(values), returning the sum of a list of integers. An empty list returns 0. Return the result; do not just print it.",
    "starter": {
      "python": "def total(values):\n    # Write your solution here\n    pass",
      "pseudocode": "function total(values)\n    // Write your solution here\nendfunction"
    },
    "solution": {
      "python": "def total(values):\n    result = 0\n    for value in values:\n        result += value\n    return result",
      "pseudocode": "function total(values)\n    result = 0\n    for i = 0 to values.length - 1\n        result = result + values[i]\n    next i\n    return result\nendfunction"
    },
    "rubric": [
      "Accept the collection as a parameter",
      "Initialise an accumulator to zero",
      "Process every value exactly once",
      "Return the total, including zero for empty input"
    ],
    "tests": [
      {
        "label": "Mixed readings",
        "expression": "total([7,-2,4])",
        "expected": 9,
        "setup": ""
      },
      {
        "label": "Empty list",
        "expression": "total([])",
        "expected": 0,
        "setup": ""
      },
      {
        "label": "One reading",
        "expression": "total([8])",
        "expected": 8,
        "setup": ""
      },
      {
        "label": "Negative readings",
        "expression": "total([-4,-6])",
        "expected": -10,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "count",
    "title": "02 · Count passing marks",
    "topic": "2.2.1",
    "kind": "Fill the gaps",
    "prompt": "Complete count_passes(marks, threshold). Count marks greater than or equal to threshold. Replace each ___ in the Python starter.",
    "starter": {
      "python": "def count_passes(marks, threshold):\n    count = ___\n    for mark in marks:\n        if mark ___ threshold:\n            count = count + ___\n    return ___",
      "pseudocode": "function count_passes(marks, threshold)\n    count = ___\n    for i = 0 to marks.length - 1\n        if marks[i] ___ threshold then\n            count = count + ___\n        endif\n    next i\n    return ___\nendfunction"
    },
    "solution": {
      "python": "def count_passes(marks, threshold):\n    count = 0\n    for mark in marks:\n        if mark >= threshold:\n            count = count + 1\n    return count",
      "pseudocode": "function count_passes(marks, threshold)\n    count = 0\n    for i = 0 to marks.length - 1\n        if marks[i] >= threshold then\n            count = count + 1\n        endif\n    next i\n    return count\nendfunction"
    },
    "rubric": [
      "Initialise count to zero",
      "Include marks equal to threshold",
      "Increment once per qualifying mark",
      "Return the count"
    ],
    "tests": [
      {
        "label": "Boundary included",
        "expression": "count_passes([39,40,41],40)",
        "expected": 2,
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "count_passes([],50)",
        "expected": 0,
        "setup": ""
      },
      {
        "label": "No passes",
        "expression": "count_passes([1,2],3)",
        "expected": 0,
        "setup": ""
      },
      {
        "label": "All pass",
        "expression": "count_passes([70,70,90],70)",
        "expected": 3,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "maximum",
    "title": "03 · Find the maximum",
    "topic": "2.2.1",
    "kind": "Debug a function",
    "prompt": "The input is a nonempty list of integers. Fix maximum(values) so that all-negative inputs work too.",
    "starter": {
      "python": "def maximum(values):\n    largest = 0\n    for value in values:\n        if value > largest:\n            largest = value\n    return largest",
      "pseudocode": "function maximum(values)\n    largest = 0\n    for i = 0 to values.length - 1\n        if values[i] > largest then\n            largest = values[i]\n        endif\n    next i\n    return largest\nendfunction"
    },
    "solution": {
      "python": "def maximum(values):\n    largest = values[0]\n    for value in values:\n        if value > largest:\n            largest = value\n    return largest",
      "pseudocode": "function maximum(values)\n    largest = values[0]\n    for i = 1 to values.length - 1\n        if values[i] > largest then\n            largest = values[i]\n        endif\n    next i\n    return largest\nendfunction"
    },
    "rubric": [
      "Initialise from an actual list element",
      "Compare every remaining value",
      "Update only when a larger value is found",
      "Return the largest value"
    ],
    "tests": [
      {
        "label": "All negative",
        "expression": "maximum([-8,-3,-12])",
        "expected": -3,
        "setup": ""
      },
      {
        "label": "One value",
        "expression": "maximum([-7])",
        "expected": -7,
        "setup": ""
      },
      {
        "label": "Mixed",
        "expression": "maximum([4,9,2,9])",
        "expected": 9,
        "setup": ""
      },
      {
        "label": "Zero",
        "expression": "maximum([0,-1])",
        "expected": 0,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Is zero guaranteed to be in the input? Your initial candidate should be an actual value."
  },
  {
    "id": "validation",
    "title": "04 · Validate an integer string",
    "topic": "2.1.4",
    "kind": "Write a function",
    "prompt": "Write is_digits(text). Return True only for a nonempty string containing ASCII digits 0 to 9. Signs, spaces and decimal points are invalid.",
    "starter": {
      "python": "def is_digits(text):\n    pass",
      "pseudocode": "function is_digits(text)\n    // Return true or false\nendfunction"
    },
    "solution": {
      "python": "def is_digits(text):\n    if len(text) == 0:\n        return False\n    for char in text:\n        if char < \"0\" or char > \"9\":\n            return False\n    return True",
      "pseudocode": "function is_digits(text)\n    if text.length == 0 then\n        return false\n    endif\n    for i = 0 to text.length - 1\n        ch = text.substring(i, 1)\n        if ch < \"0\" or ch > \"9\" then\n            return false\n        endif\n    next i\n    return true\nendfunction"
    },
    "rubric": [
      "Reject the empty string",
      "Inspect all characters",
      "Reject characters outside ASCII 0 to 9",
      "Return a Boolean result"
    ],
    "tests": [
      {
        "label": "Digits",
        "expression": "is_digits(\"1090\")",
        "expected": true,
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "is_digits(\"\")",
        "expected": false,
        "setup": ""
      },
      {
        "label": "Sign",
        "expression": "is_digits(\"-2\")",
        "expected": false,
        "setup": ""
      },
      {
        "label": "Space",
        "expression": "is_digits(\"12 \")",
        "expected": false,
        "setup": ""
      },
      {
        "label": "Decimal",
        "expression": "is_digits(\"1.2\")",
        "expected": false,
        "setup": ""
      },
      {
        "label": "Non-ASCII digit",
        "expression": "is_digits(\"²\")",
        "expected": false,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "linear",
    "title": "05 · Linear search",
    "topic": "2.3.1",
    "kind": "Write a function",
    "prompt": "Write linear_search(values, target). Return the zero-based index of the FIRST match, or -1 if absent. The input need not be sorted.",
    "starter": {
      "python": "def linear_search(values, target):\n    pass",
      "pseudocode": "function linear_search(values, target)\nendfunction"
    },
    "solution": {
      "python": "def linear_search(values, target):\n    for i in range(len(values)):\n        if values[i] == target:\n            return i\n    return -1",
      "pseudocode": "function linear_search(values, target)\n    for i = 0 to values.length - 1\n        if values[i] == target then\n            return i\n        endif\n    next i\n    return -1\nendfunction"
    },
    "rubric": [
      "Visit items in index order",
      "Compare each item with target",
      "Return the first matching index",
      "Return -1 only after no match is found"
    ],
    "tests": [
      {
        "label": "Middle",
        "expression": "linear_search([8,3,7],3)",
        "expected": 1,
        "setup": ""
      },
      {
        "label": "First duplicate",
        "expression": "linear_search([5,2,5],5)",
        "expected": 0,
        "setup": ""
      },
      {
        "label": "Missing",
        "expression": "linear_search([1,2],9)",
        "expected": -1,
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "linear_search([],9)",
        "expected": -1,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "binary",
    "title": "06 · Repair binary search",
    "topic": "2.3.1",
    "kind": "Fill the gaps",
    "prompt": "Complete binary_search(values, target) for ascending, unique integers. Return the zero-based index or -1. The empty list is allowed.",
    "starter": {
      "python": "def binary_search(values, target):\n    low = 0\n    high = len(values) - 1\n    while low ___ high:\n        mid = (low + high) // 2\n        if values[mid] == target:\n            return mid\n        elif values[mid] < target:\n            low = ___\n        else:\n            high = ___\n    return -1",
      "pseudocode": "function binary_search(values, target)\n    low = 0\n    high = values.length - 1\n    while low ___ high\n        mid = (low + high) DIV 2\n        if values[mid] == target then\n            return mid\n        elseif values[mid] < target then\n            low = ___\n        else\n            high = ___\n        endif\n    endwhile\n    return -1\nendfunction"
    },
    "solution": {
      "python": "def binary_search(values, target):\n    low, high = 0, len(values) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if values[mid] == target:\n            return mid\n        elif values[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
      "pseudocode": "function binary_search(values, target)\n    low = 0\n    high = values.length - 1\n    while low <= high\n        mid = (low + high) DIV 2\n        if values[mid] == target then\n            return mid\n        elseif values[mid] < target then\n            low = mid + 1\n        else\n            high = mid - 1\n        endif\n    endwhile\n    return -1\nendfunction"
    },
    "rubric": [
      "Include low == high in the search",
      "Calculate integer midpoint",
      "Discard midpoint when updating lower bound",
      "Discard midpoint when updating upper bound",
      "Return -1 for absence; inspect logarithmic search method yourself"
    ],
    "tests": [
      {
        "label": "First",
        "expression": "binary_search([2,4,6,8,10],2)",
        "expected": 0,
        "setup": ""
      },
      {
        "label": "Last",
        "expression": "binary_search([2,4,6,8,10],10)",
        "expected": 4,
        "setup": ""
      },
      {
        "label": "Middle",
        "expression": "binary_search([2,4,6,8,10],6)",
        "expected": 2,
        "setup": ""
      },
      {
        "label": "Missing between",
        "expression": "binary_search([2,4,6,8],5)",
        "expected": -1,
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "binary_search([],5)",
        "expected": -1,
        "setup": ""
      },
      {
        "label": "Singleton",
        "expression": "binary_search([5],5)",
        "expected": 0,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "bubble",
    "title": "07 · One bubble-sort pass",
    "topic": "2.3.1",
    "kind": "Write a function",
    "prompt": "Write bubble_pass(values). Perform exactly one left-to-right ascending bubble-sort pass, modifying the input list, and return it. Compare adjacent pairs once in order.",
    "starter": {
      "python": "def bubble_pass(values):\n    pass",
      "pseudocode": "function bubble_pass(values)\nendfunction"
    },
    "solution": {
      "python": "def bubble_pass(values):\n    for i in range(len(values) - 1):\n        if values[i] > values[i + 1]:\n            values[i], values[i + 1] = values[i + 1], values[i]\n    return values",
      "pseudocode": "function bubble_pass(values)\n    for i = 0 to values.length - 2\n        if values[i] > values[i+1] then\n            temp = values[i]\n            values[i] = values[i+1]\n            values[i+1] = temp\n        endif\n    next i\n    return values\nendfunction"
    },
    "rubric": [
      "Compare adjacent pairs left to right",
      "Swap only out-of-order pairs",
      "Avoid going beyond final index",
      "Perform one pass, not a complete sort"
    ],
    "tests": [
      {
        "label": "Unsorted",
        "expression": "bubble_pass([5,1,4,2])",
        "expected": [
          1,
          4,
          2,
          5
        ],
        "setup": ""
      },
      {
        "label": "Descending",
        "expression": "bubble_pass([4,3,2,1])",
        "expected": [
          3,
          2,
          1,
          4
        ],
        "setup": ""
      },
      {
        "label": "Already sorted",
        "expression": "bubble_pass([1,2,3])",
        "expected": [
          1,
          2,
          3
        ],
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "bubble_pass([])",
        "expected": [],
        "setup": ""
      },
      {
        "label": "Mutation",
        "expression": "v",
        "expected": [
          2,
          1,
          3
        ],
        "setup": "v = [3,2,1]\nbubble_pass(v)"
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "insertion",
    "title": "08 · Insertion sort",
    "topic": "2.3.1",
    "kind": "Write a function",
    "prompt": "Write insertion_sort(values), sorting the list in ascending order and returning it. Use insertion sort rather than a built-in sort. Behaviour tests cannot prove the algorithm used: check the method rubric too.",
    "starter": {
      "python": "def insertion_sort(values):\n    pass",
      "pseudocode": "function insertion_sort(values)\nendfunction"
    },
    "solution": {
      "python": "def insertion_sort(values):\n    for i in range(1, len(values)):\n        key = values[i]\n        j = i - 1\n        while j >= 0 and values[j] > key:\n            values[j + 1] = values[j]\n            j -= 1\n        values[j + 1] = key\n    return values",
      "pseudocode": "function insertion_sort(values)\n    for i = 1 to values.length - 1\n        key = values[i]\n        j = i - 1\n        while j >= 0 and values[j] > key\n            values[j+1] = values[j]\n            j = j - 1\n        endwhile\n        values[j+1] = key\n    next i\n    return values\nendfunction"
    },
    "rubric": [
      "Grow a sorted prefix one item at a time",
      "Store the next key before shifting",
      "Shift larger items to the right",
      "Insert the key at the correct position",
      "Check that insertion sort, not a built-in sort, was used"
    ],
    "tests": [
      {
        "label": "Reverse",
        "expression": "insertion_sort([4,3,2,1])",
        "expected": [
          1,
          2,
          3,
          4
        ],
        "setup": ""
      },
      {
        "label": "Duplicates",
        "expression": "insertion_sort([3,1,3,-2])",
        "expected": [
          -2,
          1,
          3,
          3
        ],
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "insertion_sort([])",
        "expected": [],
        "setup": ""
      },
      {
        "label": "Sorted",
        "expression": "insertion_sort([1,2,3])",
        "expected": [
          1,
          2,
          3
        ],
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "merge",
    "title": "09 · Merge two sorted lists",
    "topic": "2.3.1",
    "kind": "Write a function",
    "prompt": "Write merge(left, right), returning a new ascending list containing both sorted inputs. Do not alter the input lists. Use the two-pointer merge method.",
    "starter": {
      "python": "def merge(left, right):\n    pass",
      "pseudocode": "function merge(left, right)\nendfunction"
    },
    "solution": {
      "python": "def merge(left, right):\n    out = []\n    i = j = 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            out.append(left[i]); i += 1\n        else:\n            out.append(right[j]); j += 1\n    return out + left[i:] + right[j:]",
      "pseudocode": "function merge(left, right)\n    result = []\n    i = 0\n    j = 0\n    while i < left.length and j < right.length\n        if left[i] <= right[j] then\n            result.append(left[i])\n            i = i + 1\n        else\n            result.append(right[j])\n            j = j + 1\n        endif\n    endwhile\n    while i < left.length\n        result.append(left[i])\n        i = i + 1\n    endwhile\n    while j < right.length\n        result.append(right[j])\n        j = j + 1\n    endwhile\n    return result\nendfunction"
    },
    "rubric": [
      "Maintain separate positions for both inputs",
      "Append the smaller current item and advance its pointer",
      "Preserve duplicate values",
      "Append all remaining items",
      "Return new output without changing inputs; review method"
    ],
    "tests": [
      {
        "label": "Interleave",
        "expression": "merge([2,7,9],[1,7,8])",
        "expected": [
          1,
          2,
          7,
          7,
          8,
          9
        ],
        "setup": ""
      },
      {
        "label": "Empty left",
        "expression": "merge([],[2,3])",
        "expected": [
          2,
          3
        ],
        "setup": ""
      },
      {
        "label": "Both empty",
        "expression": "merge([],[])",
        "expected": [],
        "setup": ""
      },
      {
        "label": "Unequal lengths",
        "expression": "merge([1],[2,3,4])",
        "expected": [
          1,
          2,
          3,
          4
        ],
        "setup": ""
      },
      {
        "label": "Inputs preserved",
        "expression": "[a,b]",
        "expected": [
          [
            2,
            4
          ],
          [
            1,
            3
          ]
        ],
        "setup": "a=[2,4]\nb=[1,3]\nmerge(a,b)"
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "factorial",
    "title": "10 · Recursive factorial",
    "topic": "2.2.1",
    "kind": "Write a function",
    "prompt": "Write factorial(n) recursively for integers 0 <= n <= 10. Use 0! = 1. Tests check results; review whether your implementation is actually recursive.",
    "starter": {
      "python": "def factorial(n):\n    pass",
      "pseudocode": "function factorial(n)\nendfunction"
    },
    "solution": {
      "python": "def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)",
      "pseudocode": "function factorial(n)\n    if n == 0 then\n        return 1\n    endif\n    return n * factorial(n - 1)\nendfunction"
    },
    "rubric": [
      "Include a reachable base case",
      "Return 1 for n=0",
      "Make a recursive call with n-1",
      "Multiply by n and return the result"
    ],
    "tests": [
      {
        "label": "Zero",
        "expression": "factorial(0)",
        "expected": 1,
        "setup": ""
      },
      {
        "label": "One",
        "expression": "factorial(1)",
        "expected": 1,
        "setup": ""
      },
      {
        "label": "Five",
        "expression": "factorial(5)",
        "expected": 120,
        "setup": ""
      },
      {
        "label": "Ten",
        "expression": "factorial(10)",
        "expected": 3628800,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "gcd",
    "title": "11 · Euclid’s recursive algorithm",
    "topic": "2.2.1",
    "kind": "Fill the gaps",
    "prompt": "Complete gcd(a, b) for nonnegative integers, at least one nonzero. Use recursion and the remainder operation.",
    "starter": {
      "python": "def gcd(a, b):\n    if b == ___:\n        return ___\n    return gcd(___, ___)",
      "pseudocode": "function gcd(a,b)\n    if b == ___ then\n        return ___\n    endif\n    return gcd(___, ___)\nendfunction"
    },
    "solution": {
      "python": "def gcd(a, b):\n    if b == 0:\n        return a\n    return gcd(b, a % b)",
      "pseudocode": "function gcd(a,b)\n    if b == 0 then\n        return a\n    endif\n    return gcd(b, a MOD b)\nendfunction"
    },
    "rubric": [
      "Stop when b is zero",
      "Return a at the base case",
      "Pass b as the next first argument",
      "Pass a MOD b as the next second argument"
    ],
    "tests": [
      {
        "label": "Common factor",
        "expression": "gcd(48,18)",
        "expected": 6,
        "setup": ""
      },
      {
        "label": "Coprime",
        "expression": "gcd(7,3)",
        "expected": 1,
        "setup": ""
      },
      {
        "label": "Zero second",
        "expression": "gcd(9,0)",
        "expected": 9,
        "setup": ""
      },
      {
        "label": "Zero first",
        "expression": "gcd(0,9)",
        "expected": 9,
        "setup": ""
      },
      {
        "label": "Equal",
        "expression": "gcd(12,12)",
        "expected": 12,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "linked",
    "title": "12 · Search a linked list",
    "topic": "2.3.1",
    "kind": "Fill the gaps",
    "prompt": "nodes is a list of dictionaries with data and next fields. head and next are indices; -1 means no node. The list is acyclic. Complete find_node(nodes, head, target) to return the first matching node index, or -1.",
    "starter": {
      "python": "def find_node(nodes, head, target):\n    current = ___\n    while current != ___:\n        if nodes[current][\"data\"] == target:\n            return current\n        current = ___\n    return -1",
      "pseudocode": "function find_node(nodes, head, target)\n    current = ___\n    while current != ___\n        if nodes[current].data == target then\n            return current\n        endif\n        current = ___\n    endwhile\n    return -1\nendfunction"
    },
    "solution": {
      "python": "def find_node(nodes, head, target):\n    current = head\n    while current != -1:\n        if nodes[current][\"data\"] == target:\n            return current\n        current = nodes[current][\"next\"]\n    return -1",
      "pseudocode": "function find_node(nodes, head, target)\n    current = head\n    while current != -1\n        if nodes[current].data == target then\n            return current\n        endif\n        current = nodes[current].next\n    endwhile\n    return -1\nendfunction"
    },
    "rubric": [
      "Start at the head pointer",
      "Stop at the null sentinel",
      "Compare data and return matching index",
      "Follow next pointers rather than physical array order",
      "Return -1 when absent"
    ],
    "tests": [
      {
        "label": "Follow pointers",
        "expression": "find_node([{ \"data\":\"end\",\"next\":-1},{\"data\":\"start\",\"next\":0}],1,\"end\")",
        "expected": 0,
        "setup": ""
      },
      {
        "label": "Head match",
        "expression": "find_node([{\"data\":4,\"next\":-1}],0,4)",
        "expected": 0,
        "setup": ""
      },
      {
        "label": "Missing",
        "expression": "find_node([{\"data\":4,\"next\":-1}],0,9)",
        "expected": -1,
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "find_node([],-1,9)",
        "expected": -1,
        "setup": ""
      },
      {
        "label": "Ignore unlinked node",
        "expression": "find_node([{\"data\":9,\"next\":-1},{\"data\":4,\"next\":-1}],1,9)",
        "expected": -1,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "bst",
    "title": "13 · Search a binary search tree",
    "topic": "2.3.1",
    "kind": "Write a function",
    "prompt": "Write contains(root, target), returning a Boolean. Node exposes value, left and right; None is an empty subtree. Keys are unique. Use the BST property to choose a branch.",
    "starter": {
      "python": "def contains(root, target):\n    pass",
      "pseudocode": "function contains(root, target)\nendfunction"
    },
    "solution": {
      "python": "def contains(root, target):\n    if root is None:\n        return False\n    if root.value == target:\n        return True\n    if target < root.value:\n        return contains(root.left, target)\n    return contains(root.right, target)",
      "pseudocode": "function contains(root, target)\n    if root == null then\n        return false\n    endif\n    if root.value == target then\n        return true\n    elseif target < root.value then\n        return contains(root.left, target)\n    else\n        return contains(root.right, target)\n    endif\nendfunction"
    },
    "rubric": [
      "Handle an empty subtree",
      "Return true for a match",
      "Use the left subtree for smaller targets",
      "Use the right subtree for larger targets"
    ],
    "tests": [
      {
        "label": "Left descendant",
        "expression": "contains(Node(8, Node(3, Node(1), Node(6)), Node(10)),6)",
        "expected": true,
        "setup": ""
      },
      {
        "label": "Right",
        "expression": "contains(Node(8, Node(3, Node(1), Node(6)), Node(10)),10)",
        "expected": true,
        "setup": ""
      },
      {
        "label": "Missing",
        "expression": "contains(Node(8, Node(3, Node(1), Node(6)), Node(10)),7)",
        "expected": false,
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "contains(None,1)",
        "expected": false,
        "setup": ""
      },
      {
        "label": "Root",
        "expression": "contains(Node(8, Node(3, Node(1), Node(6)), Node(10)),8)",
        "expected": true,
        "setup": ""
      }
    ],
    "prelude": "class Node:\n    def __init__(self, value, left=None, right=None):\n        self.value = value\n        self.left = left\n        self.right = right",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "postorder",
    "title": "14 · Post-order traversal",
    "topic": "2.3.1",
    "kind": "Write a function",
    "prompt": "Write postorder(root), returning a list of values in left-right-root order. Use the supplied Node class. None represents an empty tree.",
    "starter": {
      "python": "def postorder(root):\n    pass",
      "pseudocode": "function postorder(root)\nendfunction"
    },
    "solution": {
      "python": "def postorder(root):\n    if root is None:\n        return []\n    return postorder(root.left) + postorder(root.right) + [root.value]",
      "pseudocode": "function postorder(root)\n    if root == null then\n        return []\n    endif\n    // + concatenates lists in this worked answer\n    return postorder(root.left) + postorder(root.right) + [root.value]\nendfunction"
    },
    "rubric": [
      "Handle an empty tree",
      "Traverse the left subtree",
      "Traverse the right subtree",
      "Append the root after both subtrees"
    ],
    "tests": [
      {
        "label": "Branching tree",
        "expression": "postorder(Node(8, Node(3, Node(1), Node(6)), Node(10)))",
        "expected": [
          1,
          6,
          3,
          10,
          8
        ],
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "postorder(None)",
        "expected": [],
        "setup": ""
      },
      {
        "label": "Leaf",
        "expression": "postorder(Node(9))",
        "expected": [
          9
        ],
        "setup": ""
      },
      {
        "label": "One-sided",
        "expression": "postorder(Node(3,None,Node(4)))",
        "expected": [
          4,
          3
        ],
        "setup": ""
      }
    ],
    "prelude": "class Node:\n    def __init__(self, value, left=None, right=None):\n        self.value = value\n        self.left = left\n        self.right = right",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "breadth",
    "title": "15 · Breadth-first traversal",
    "topic": "2.3.1",
    "kind": "Write a function",
    "prompt": "Write breadth_first(root), returning values level by level, left before right. Use the supplied Node class. Return [] for None.",
    "starter": {
      "python": "def breadth_first(root):\n    pass",
      "pseudocode": "function breadth_first(root)\nendfunction"
    },
    "solution": {
      "python": "def breadth_first(root):\n    if root is None:\n        return []\n    queue = [root]\n    result = []\n    head = 0\n    while head < len(queue):\n        node = queue[head]\n        head += 1\n        result.append(node.value)\n        if node.left is not None:\n            queue.append(node.left)\n        if node.right is not None:\n            queue.append(node.right)\n    return result",
      "pseudocode": "function breadth_first(root)\n    if root == null then\n        return []\n    endif\n    queue = [root]\n    result = []\n    head = 0\n    while head < queue.length\n        node = queue[head]\n        head = head + 1\n        result.append(node.value)\n        if node.left != null then\n            queue.append(node.left)\n        endif\n        if node.right != null then\n            queue.append(node.right)\n        endif\n    endwhile\n    return result\nendfunction"
    },
    "rubric": [
      "Handle empty input",
      "Use FIFO processing",
      "Visit each node once",
      "Enqueue existing left child before right child",
      "Return the ordered values"
    ],
    "tests": [
      {
        "label": "Levels",
        "expression": "breadth_first(Node(8, Node(3, Node(1), Node(6)), Node(10)))",
        "expected": [
          8,
          3,
          10,
          1,
          6
        ],
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "breadth_first(None)",
        "expected": [],
        "setup": ""
      },
      {
        "label": "Leaf",
        "expression": "breadth_first(Node(2))",
        "expected": [
          2
        ],
        "setup": ""
      },
      {
        "label": "Chain",
        "expression": "breadth_first(Node(3,None,Node(4,None,Node(5))))",
        "expected": [
          3,
          4,
          5
        ],
        "setup": ""
      }
    ],
    "prelude": "class Node:\n    def __init__(self, value, left=None, right=None):\n        self.value = value\n        self.left = left\n        self.right = right",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "stack",
    "title": "16 · Build a bounded stack",
    "topic": "2.2.1",
    "kind": "Write a class",
    "prompt": "Implement Stack(capacity), push(value) and pop(). capacity is positive. push returns True on success, False when full. pop returns the last pushed value, or None when empty. Store separate state per instance. Values are integers.",
    "starter": {
      "python": "class Stack:\n    def __init__(self, capacity):\n        pass\n\n    def push(self, value):\n        pass\n\n    def pop(self):\n        pass",
      "pseudocode": "class Stack\n    // Declare state, constructor, push and pop\nendclass"
    },
    "solution": {
      "python": "class Stack:\n    def __init__(self, capacity):\n        self.capacity = capacity\n        self.items = []\n    def push(self, value):\n        if len(self.items) >= self.capacity:\n            return False\n        self.items.append(value)\n        return True\n    def pop(self):\n        if len(self.items) == 0:\n            return None\n        return self.items.pop()",
      "pseudocode": "class Stack\n    private capacity, items\n    public procedure new(limit)\n        capacity = limit\n        items = []\n    endprocedure\n    public function push(value)\n        if items.length >= capacity then\n            return false\n        endif\n        items.append(value)\n        return true\n    endfunction\n    public function pop()\n        if items.length == 0 then\n            return null\n        endif\n        // removeLast removes and returns the final item\n        return items.removeLast()\n    endfunction\nendclass"
    },
    "rubric": [
      "Initialise separate instance state",
      "Store capacity and reject overflow",
      "Add items to the top",
      "Remove in LIFO order",
      "Handle underflow",
      "Return the required success and empty values"
    ],
    "tests": [
      {
        "label": "Empty",
        "expression": "s.pop()",
        "expected": null,
        "setup": "s=Stack(2)"
      },
      {
        "label": "Capacity",
        "expression": "[s.push(1),s.push(2),s.push(3)]",
        "expected": [
          true,
          true,
          false
        ],
        "setup": "s=Stack(2)"
      },
      {
        "label": "LIFO",
        "expression": "[s.pop(),s.pop(),s.pop()]",
        "expected": [
          7,
          3,
          null
        ],
        "setup": "s=Stack(2)\ns.push(3)\ns.push(7)"
      },
      {
        "label": "Independent objects",
        "expression": "b.pop()",
        "expected": null,
        "setup": "a=Stack(2)\nb=Stack(2)\na.push(8)"
      },
      {
        "label": "Reuse capacity",
        "expression": "[s.push(5),s.pop()]",
        "expected": [
          true,
          5
        ],
        "setup": "s=Stack(1)\ns.push(2)\ns.pop()"
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "queue",
    "title": "17 · Build a circular queue",
    "topic": "2.3.1",
    "kind": "Write a class",
    "prompt": "Implement Queue(capacity), enqueue(value) and dequeue() using a fixed-size circular buffer. enqueue returns True, or False when full. dequeue returns the oldest integer, or None when empty. capacity is positive. Tests check behaviour; review fixed-size storage and modulo wrap yourself.",
    "starter": {
      "python": "class Queue:\n    def __init__(self, capacity):\n        pass\n    def enqueue(self, value):\n        pass\n    def dequeue(self):\n        pass",
      "pseudocode": "class Queue\n    // Constructor, enqueue and dequeue\nendclass"
    },
    "solution": {
      "python": "class Queue:\n    def __init__(self, capacity):\n        self.items = [None] * capacity\n        self.head = self.tail = self.count = 0\n    def enqueue(self, value):\n        if self.count == len(self.items):\n            return False\n        self.items[self.tail] = value\n        self.tail = (self.tail + 1) % len(self.items)\n        self.count += 1\n        return True\n    def dequeue(self):\n        if self.count == 0:\n            return None\n        value = self.items[self.head]\n        self.head = (self.head + 1) % len(self.items)\n        self.count -= 1\n        return value",
      "pseudocode": "class Queue\n    private items, capacity, head, tail, count\n    public procedure new(limit)\n        capacity = limit\n        // Allocate items[0..capacity-1]\n        array items[capacity]\n        head = 0\n        tail = 0\n        count = 0\n    endprocedure\n    public function enqueue(value)\n        if count == capacity then\n            return false\n        endif\n        items[tail] = value\n        tail = (tail + 1) MOD capacity\n        count = count + 1\n        return true\n    endfunction\n    public function dequeue()\n        if count == 0 then\n            return null\n        endif\n        value = items[head]\n        head = (head + 1) MOD capacity\n        count = count - 1\n        return value\n    endfunction\nendclass"
    },
    "rubric": [
      "Allocate fixed-size storage per instance",
      "Track head, tail and count",
      "Reject overflow without corrupting contents",
      "Remove in FIFO order",
      "Wrap indices using modulo",
      "Handle underflow"
    ],
    "tests": [
      {
        "label": "Empty",
        "expression": "q.dequeue()",
        "expected": null,
        "setup": "q=Queue(2)"
      },
      {
        "label": "Overflow",
        "expression": "[q.enqueue(1),q.enqueue(2),q.enqueue(3)]",
        "expected": [
          true,
          true,
          false
        ],
        "setup": "q=Queue(2)"
      },
      {
        "label": "Wrap-around",
        "expression": "[q.dequeue(),q.dequeue(),q.dequeue()]",
        "expected": [
          2,
          3,
          null
        ],
        "setup": "q=Queue(2)\nq.enqueue(1)\nq.enqueue(2)\nq.dequeue()\nq.enqueue(3)"
      },
      {
        "label": "Capacity one",
        "expression": "[q.enqueue(4),q.dequeue(),q.enqueue(5),q.dequeue()]",
        "expected": [
          true,
          4,
          true,
          5
        ],
        "setup": "q=Queue(1)"
      },
      {
        "label": "Independent",
        "expression": "b.dequeue()",
        "expected": null,
        "setup": "a=Queue(2)\nb=Queue(2)\na.enqueue(8)"
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "class",
    "title": "18 · A validated book class",
    "topic": "2.2.1",
    "kind": "Write a class",
    "prompt": "Implement Book(title) with get_title(), borrow_book() and return_book(). New books are available. borrow_book returns True once, then False until returned. return_book makes the book available again. Its return value is not assessed.",
    "starter": {
      "python": "class Book:\n    def __init__(self, title):\n        pass\n    def get_title(self):\n        pass\n    def borrow_book(self):\n        pass\n    def return_book(self):\n        pass",
      "pseudocode": "class Book\n    // Add constructor and methods\nendclass"
    },
    "solution": {
      "python": "class Book:\n    def __init__(self, title):\n        self._title = title\n        self._available = True\n    def get_title(self):\n        return self._title\n    def borrow_book(self):\n        if not self._available:\n            return False\n        self._available = False\n        return True\n    def return_book(self):\n        self._available = True",
      "pseudocode": "class Book\n    private title, available\n    public procedure new(pTitle)\n        title = pTitle\n        available = true\n    endprocedure\n    public function get_title()\n        return title\n    endfunction\n    public function borrow_book()\n        if not available then\n            return false\n        endif\n        available = false\n        return true\n    endfunction\n    public procedure return_book()\n        available = true\n    endprocedure\nendclass"
    },
    "rubric": [
      "Constructor accepts and stores title",
      "Each instance starts available",
      "Getter returns title",
      "Borrowing changes availability",
      "Repeated borrowing fails",
      "Returning permits a later loan; review encapsulation conventions"
    ],
    "tests": [
      {
        "label": "Title",
        "expression": "b.get_title()",
        "expected": "Algorithms",
        "setup": "b=Book(\"Algorithms\")"
      },
      {
        "label": "Double loan",
        "expression": "[b.borrow_book(),b.borrow_book()]",
        "expected": [
          true,
          false
        ],
        "setup": "b=Book(\"A\")"
      },
      {
        "label": "Return then borrow",
        "expression": "b.borrow_book()",
        "expected": true,
        "setup": "b=Book(\"A\")\nb.borrow_book()\nb.return_book()"
      },
      {
        "label": "Separate instances",
        "expression": "b.borrow_book()",
        "expected": true,
        "setup": "a=Book(\"A\")\nb=Book(\"B\")\na.borrow_book()"
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "inheritance",
    "title": "19 · Inherit and override",
    "topic": "2.2.1",
    "kind": "Write a class",
    "prompt": "The supplied Ticket class stores price and returns it from cost(). Implement DiscountTicket(price, discount) inheriting Ticket. discount is a fraction from 0 to 1 inclusive. Override cost() to return price * (1-discount), rounded to two decimal places. Review constructor chaining as well as test results.",
    "starter": {
      "python": "class DiscountTicket(Ticket):\n    def __init__(self, price, discount):\n        pass\n    def cost(self):\n        pass",
      "pseudocode": "class DiscountTicket inherits Ticket\n    // Add constructor and overridden cost\nendclass"
    },
    "solution": {
      "python": "class DiscountTicket(Ticket):\n    def __init__(self, price, discount):\n        super().__init__(price)\n        self.discount = discount\n    def cost(self):\n        return round(self.price * (1 - self.discount), 2)",
      "pseudocode": "class DiscountTicket inherits Ticket\n    private discount\n    public procedure new(price, pDiscount)\n        super.new(price)\n        discount = pDiscount\n    endprocedure\n    public function cost()\n        return round(price * (1 - discount), 2)\n    endfunction\nendclass"
    },
    "rubric": [
      "Declare subclass of Ticket",
      "Accept both constructor parameters",
      "Initialise inherited state, preferably using superclass constructor",
      "Store discount per instance",
      "Override cost with the correct calculation"
    ],
    "tests": [
      {
        "label": "Subclass",
        "expression": "issubclass(DiscountTicket,Ticket)",
        "expected": true,
        "setup": ""
      },
      {
        "label": "Discount",
        "expression": "DiscountTicket(80,0.25).cost()",
        "expected": 60.0,
        "setup": ""
      },
      {
        "label": "No discount",
        "expression": "DiscountTicket(12,0).cost()",
        "expected": 12.0,
        "setup": ""
      },
      {
        "label": "Full discount",
        "expression": "DiscountTicket(12,1).cost()",
        "expected": 0.0,
        "setup": ""
      },
      {
        "label": "Rounding",
        "expression": "DiscountTicket(19.99,0.1).cost()",
        "expected": 17.99,
        "setup": ""
      },
      {
        "label": "Inherited state",
        "expression": "DiscountTicket(20,0.5).price",
        "expected": 20,
        "setup": ""
      }
    ],
    "prelude": "class Ticket:\n    def __init__(self, price):\n        self.price = price\n    def cost(self):\n        return self.price",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "dijkstra",
    "title": "20 · Relax an edge",
    "topic": "2.3.1",
    "kind": "Fill the gaps",
    "prompt": "Complete relax(distances, previous, u, v, weight). If the route through u is shorter, update distances[v] and previous[v], returning True. Otherwise leave both dictionaries unchanged and return False. Assume all keys exist and weights are nonnegative.",
    "starter": {
      "python": "def relax(distances, previous, u, v, weight):\n    candidate = ___\n    if candidate ___ distances[v]:\n        distances[v] = ___\n        previous[v] = ___\n        return True\n    return False",
      "pseudocode": "function relax(distances, previous, u, v, weight)\n    candidate = ___\n    if candidate ___ distances[v] then\n        distances[v] = ___\n        previous[v] = ___\n        return true\n    endif\n    return false\nendfunction"
    },
    "solution": {
      "python": "def relax(distances, previous, u, v, weight):\n    candidate = distances[u] + weight\n    if candidate < distances[v]:\n        distances[v] = candidate\n        previous[v] = u\n        return True\n    return False",
      "pseudocode": "function relax(distances, previous, u, v, weight)\n    candidate = distances[u] + weight\n    if candidate < distances[v] then\n        distances[v] = candidate\n        previous[v] = u\n        return true\n    endif\n    return false\nendfunction"
    },
    "rubric": [
      "Add current path distance and edge weight",
      "Compare using strict improvement",
      "Update tentative distance",
      "Update predecessor",
      "Leave state unchanged otherwise"
    ],
    "tests": [
      {
        "label": "Improvement",
        "expression": "[relax(d,p,\"A\",\"B\",4),d[\"B\"],p[\"B\"]]",
        "expected": [
          true,
          10,
          "A"
        ],
        "setup": "d={\"A\":6,\"B\":13}\np={\"B\":\"C\"}"
      },
      {
        "label": "No improvement",
        "expression": "[relax(d,p,\"A\",\"B\",9),d[\"B\"],p[\"B\"]]",
        "expected": [
          false,
          8,
          "C"
        ],
        "setup": "d={\"A\":6,\"B\":8}\np={\"B\":\"C\"}"
      },
      {
        "label": "Equal route",
        "expression": "[relax(d,p,\"A\",\"B\",2),d[\"B\"],p[\"B\"]]",
        "expected": [
          false,
          8,
          "C"
        ],
        "setup": "d={\"A\":6,\"B\":8}\np={\"B\":\"C\"}"
      },
      {
        "label": "Unreached node",
        "expression": "[relax(d,p,\"A\",\"B\",0),d[\"B\"],p[\"B\"]]",
        "expected": [
          true,
          0,
          "A"
        ],
        "setup": "d={\"A\":0,\"B\":float(\"inf\")}\np={\"B\":None}"
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "astar",
    "title": "21 · Select an A* candidate",
    "topic": "2.3.1",
    "kind": "Write a function",
    "prompt": "Write choose_node(open_nodes, g, h), returning the node with the lowest g[node]+h[node]. Break ties by the order in open_nodes. Return None if empty. g and h are dictionaries containing all listed nodes.",
    "starter": {
      "python": "def choose_node(open_nodes, g, h):\n    pass",
      "pseudocode": "function choose_node(open_nodes, g, h)\nendfunction"
    },
    "solution": {
      "python": "def choose_node(open_nodes, g, h):\n    best = None\n    for node in open_nodes:\n        if best is None or g[node] + h[node] < g[best] + h[best]:\n            best = node\n    return best",
      "pseudocode": "function choose_node(open_nodes, g, h)\n    best = null\n    bestCost = infinity\n    for i = 0 to open_nodes.length - 1\n        node = open_nodes[i]\n        cost = g[node] + h[node]\n        if cost < bestCost then\n            best = node\n            bestCost = cost\n        endif\n    next i\n    return best\nendfunction"
    },
    "rubric": [
      "Calculate f using g+h",
      "Choose the minimum f",
      "Keep the first node on ties",
      "Handle an empty open list"
    ],
    "tests": [
      {
        "label": "Lowest f",
        "expression": "choose_node([\"X\",\"Y\"],{\"X\":8,\"Y\":10},{\"X\":5,\"Y\":2})",
        "expected": "Y",
        "setup": ""
      },
      {
        "label": "Tie",
        "expression": "choose_node([\"B\",\"A\"],{\"A\":2,\"B\":1},{\"A\":1,\"B\":2})",
        "expected": "B",
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "choose_node([],{}, {})",
        "expected": null,
        "setup": ""
      },
      {
        "label": "Single",
        "expression": "choose_node([\"Q\"],{\"Q\":0},{\"Q\":0})",
        "expected": "Q",
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  },
  {
    "id": "matrix",
    "title": "22 · Count occupied seats",
    "topic": "2.2.1",
    "kind": "Write a function",
    "prompt": "Write occupied(seats) for a rectangular 2D list whose cells are 0 (free) or 1 (occupied). Return the total occupied count. Empty input and rows are allowed.",
    "starter": {
      "python": "def occupied(seats):\n    pass",
      "pseudocode": "function occupied(seats)\nendfunction"
    },
    "solution": {
      "python": "def occupied(seats):\n    total = 0\n    for row in seats:\n        for seat in row:\n            if seat == 1:\n                total += 1\n    return total",
      "pseudocode": "function occupied(seats)\n    total = 0\n    for r = 0 to seats.length - 1\n        for c = 0 to seats[r].length - 1\n            if seats[r][c] == 1 then\n                total = total + 1\n            endif\n        next c\n    next r\n    return total\nendfunction"
    },
    "rubric": [
      "Initialise a count",
      "Visit every row",
      "Visit every column in each row",
      "Count occupied cells and return total"
    ],
    "tests": [
      {
        "label": "Mixed",
        "expression": "occupied([[1,0,1],[0,1,0]])",
        "expected": 3,
        "setup": ""
      },
      {
        "label": "Empty",
        "expression": "occupied([])",
        "expected": 0,
        "setup": ""
      },
      {
        "label": "Empty rows",
        "expression": "occupied([[],[]])",
        "expected": 0,
        "setup": ""
      },
      {
        "label": "All occupied",
        "expression": "occupied([[1,1],[1,1]])",
        "expected": 4,
        "setup": ""
      },
      {
        "label": "Free",
        "expression": "occupied([[0,0]])",
        "expected": 0,
        "setup": ""
      }
    ],
    "prelude": "",
    "hint": "Trace one ordinary input by hand, then check the empty or boundary case."
  }
];
