import { defaultLocale, isLocale, type Locale } from "./config";
import en from "./dictionaries/en";
import ur from "./dictionaries/ur";

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T;

export type Dictionary = Widen<typeof en>;

const dictionaries: Record<Locale, Dictionary> = { en, ur };

export function getDictionary(locale: string = defaultLocale): Dictionary {
  return dictionaries[isLocale(locale) ? locale : defaultLocale];
}
