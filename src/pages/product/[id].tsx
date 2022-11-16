import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

import { useState } from "react";

import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { api } from "../../services/api";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import {
    ImageContainer,
    ProductContainer,
    ProductDetails,
} from "../../styles/pages/product";

interface ProductProps {
    product: {
        id: string;
        name: string;
        imageUrl: string;
        price: string;
        defaultPriceId: string;
        description: string;
    };
}

export default function Product({ product }: ProductProps) {
    const { isFallback } = useRouter();
    const [isLoadingCheckoutSession, setIsLoadingCheckoutSession] =
        useState(false);

    if (isFallback) {
        return (
            <>
                <Head>
                    <title>Ignite Shop</title>
                </Head>

                <SkeletonTheme baseColor="#202020" highlightColor="#444">
                    <ProductContainer>
                        <Skeleton width={576} height={656} />

                        <ProductDetails>
                            <Skeleton height={40} />
                            <div>
                                <Skeleton width={100} />
                            </div>
                            <div
                                style={{
                                    marginTop: "2.5rem",
                                }}
                            >
                                <Skeleton count={4} />
                            </div>

                            <div
                                style={{
                                    marginTop: "auto",
                                }}
                            >
                                <Skeleton height={60} />
                            </div>
                        </ProductDetails>
                    </ProductContainer>
                </SkeletonTheme>
            </>
        );
    }

    async function handleBuyProduct() {
        try {
            setIsLoadingCheckoutSession(true);

            const response = await api.post("/checkout", {
                priceId: product.defaultPriceId,
            });
            const { checkoutUrl } = await response.data;

            window.location.href = checkoutUrl;
        } catch (error) {
            setIsLoadingCheckoutSession(false);
            console.log(error);
        }
    }

    return (
        <>
            <Head>
                <title>Ignite Shop - {product.name}</title>
            </Head>

            <ProductContainer>
                <ImageContainer>
                    <Image
                        src={product.imageUrl}
                        width={520}
                        height={480}
                        alt=""
                    />
                </ImageContainer>
                <ProductDetails>
                    <h1>{product.name}</h1>
                    <span>{product.price}</span>
                    <p>{product.description}</p>

                    <button
                        onClick={handleBuyProduct}
                        disabled={isLoadingCheckoutSession}
                    >
                        Comprar agora
                    </button>
                </ProductDetails>
            </ProductContainer>
        </>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: true,
    };
};

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({
    params,
}) => {
    const productId = params!.id;

    const product = await stripe.products.retrieve(productId, {
        expand: ["default_price"],
    });

    const price = product.default_price as Stripe.Price;

    return {
        props: {
            product: {
                id: product.id,
                name: product.name,
                imageUrl: product.images[0],
                price: new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }).format((price.unit_amount as number) / 100),
                defaultPriceId: price.id,
                description: product.description,
            },
        },
        revalidate: 60 * 60 * 1, // 1 hour
    };
};
