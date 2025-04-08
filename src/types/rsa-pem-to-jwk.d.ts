declare module "rsa-pem-to-jwk" {
    interface JWKOptions {
        use?: string;
        alg?: string;
    }

    interface JWK {
        kty: string;
        use: string;
        alg: string;
        n: string;
        e: string;
    }

    export function pem2jwk(pem: string, options?: JWKOptions): JWK;
}
