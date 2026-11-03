/** Word list indexed as forward and reverse tries, for fast move generation. */

export interface TrieNode {
  readonly children: Map<string, TrieNode>;
  /** The complete word ending here, if any. */
  word?: string;
}

export interface Lexicon {
  readonly size: number;
  has(word: string): boolean;
  /** Trie of words, read first letter to last. */
  readonly forward: TrieNode;
  /** Trie of reversed words, read last letter to first. The stored word is the original. */
  readonly reverse: TrieNode;
}

const newNode = (): TrieNode => ({ children: new Map() });

function insert(root: TrieNode, key: string, word: string): void {
  let node = root;
  for (const ch of key) {
    let next = node.children.get(ch);
    if (!next) {
      next = newNode();
      node.children.set(ch, next);
    }
    node = next;
  }
  node.word = word;
}

/** Build a lexicon from words in any case. Blank lines are ignored. */
export function createLexicon(words: Iterable<string>): Lexicon {
  const set = new Set<string>();
  for (const raw of words) {
    const w = raw.trim().toLowerCase();
    if (w) set.add(w);
  }
  const forward = newNode();
  const reverse = newNode();
  for (const w of set) {
    insert(forward, w, w);
    insert(reverse, [...w].reverse().join(''), w);
  }
  return { size: set.size, has: (w) => set.has(w.toLowerCase()), forward, reverse };
}

/** Parse a newline-separated word list file. */
export const parseWordList = (text: string): string[] => text.split(/\r?\n/);
