"use client";

import { useEffect, useRef, useState } from "react";
import type { BizosProduct } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { AddToCartButton } from "./AddToCartButton";
import { QuantityStepper } from "./QuantityStepper";
import { WishlistButton } from "./WishlistButton";

export function ProductBuyBox({ product }: { product: BizosProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [stickyVisible, setStickyVisible] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = anchor.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setStickyVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="buy-row" ref={anchor}>
        <QuantityStepper value={quantity} onChange={(n) => setQuantity(Math.max(1, n))} label={`Quantity of ${product.name}`} />
        <AddToCartButton product={product} quantity={quantity} className="btn btn-gold btn-lg" />
        <WishlistButton id={product.id} name={product.name} />
      </div>
      <div className={`sticky-buy ${stickyVisible ? "show" : ""}`} aria-hidden={!stickyVisible}>
        <div>
          <strong>{product.name}</strong>
          <span>{formatCurrency(product.regularPrice * quantity)}</span>
        </div>
        <span tabIndex={stickyVisible ? undefined : -1}>
          <AddToCartButton product={product} quantity={quantity} className="btn btn-gold" />
        </span>
      </div>
    </>
  );
}
