import type { AppProps } from "next/app";
import Image from "next/legacy/image";

import { globalStyles } from "../styles/global";
import { Container, Header } from "../styles/pages/app";

import logoImg from "../assets/logo.svg";
import Link from "next/link";

globalStyles();

export default function App({ Component, pageProps }: AppProps) {
    return (
        <Container>
            <Header>
                <Link href={"/"}>
                    <Image src={logoImg.src} alt="" width={130} height={52} />
                </Link>
            </Header>
            <Component {...pageProps} />
        </Container>
    );
}
