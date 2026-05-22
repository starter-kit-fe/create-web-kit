import { atom } from 'jotai'

export const darkModeAtom = atom(false)
export const commandCountAtom = atom(0)
export const routeModeAtom = atom<'hash' | 'memory'>('hash')
