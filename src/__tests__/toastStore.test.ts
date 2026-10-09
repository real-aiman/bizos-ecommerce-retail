import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useToastStore } from "@/stores/toastStore";

describe("toastStore", () => {
  it("keeps only the latest three toasts and dismisses by id", () => {
    act(() => { for (let i = 0; i < 5; i++) useToastStore.getState().push(`m${i}`); });
    const { toasts } = useToastStore.getState();
    expect(toasts.map((t) => t.message)).toEqual(["m2", "m3", "m4"]);
    act(() => useToastStore.getState().dismiss(toasts[0].id));
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });
});
