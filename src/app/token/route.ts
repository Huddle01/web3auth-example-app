import { AccessToken, Role } from "@huddle01/server-sdk/auth";
import * as jose from "jose";

export const dynamic = "force-dynamic";

const createToken = async (
  roomId: string,
  role: string,
  displayName: string
) => {
  const accessToken = new AccessToken({
    apiKey: process.env.API_KEY!,
    roomId: roomId as string,
    role: role,
    permissions: {
      admin: true,
      canConsume: true,
      canProduce: true,
      canProduceSources: {
        cam: true,
        mic: true,
        screen: true,
      },
      canRecvData: true,
      canSendData: true,
      canUpdateMetadata: true,
    },
    options: {
      metadata: {
        displayName: displayName,
      },
    },
  });

  const token = await accessToken.toJwt();

  return token;
};

export async function POST(request: Request) {
  const { roomId, appPubKey } = await request.json();
  const idToken = request.headers.get("authorization")?.split(" ")[1];

  if (!idToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const jwks = jose.createRemoteJWKSet(
    new URL("https://api-auth.web3auth.io/jwks")
  );

  const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
    algorithms: ["ES256"],
  });

  let token: string;

  if ((jwtDecoded.payload as any).wallets[0].public_key === appPubKey) {
    token = await createToken(
      roomId,
      Role.HOST,
      (jwtDecoded.payload as any).name
    );
  } else {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(token, { status: 200 });
}
