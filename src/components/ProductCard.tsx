import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";
import type { BizosProduct } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { unitLabel } from "@/lib/catalog";
import { isOnSale, savingsPercent } from "@/lib/deals";
import { CompareButton } from "./CompareButton";

export function ProductCard({ product, priority = false }: { product: BizosProduct; priority?: boolean }) {
  const unit = unitLabel(product);
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} tabIndex={-1}>
          <Image
            src={product.productImageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-image"
          />
        </Link>
        <div className="card-actions">
          <span className="chip">{product.departmentName}</span>
          <span className="card-buttons"><CompareButton id={product.id} name={product.name} /><WishlistButton id={product.id} name={product.name} /></span>
        </div>
      </div>
      <div className="product-card-body">
        <Link href={`/products/${product.slug}`} className="product-title">{product.name}</Link>
        <p className="product-price">
          <strong>{formatCurrency(product.regularPrice)}</strong>
          {isOnSale(product) && <><s className="was">{formatCurrency(product.compareAtPrice!)}</s><span className="save-badge">−{savingsPercent(product)}%</span></>}
          {unit && <span> / {unit}</span>}
        </p>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
