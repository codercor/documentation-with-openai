// pages/api/qa.ts
import { OpenAIStream, OpenAIStreamPayload } from "../../utils/OpenAIStream";
export const config = {
    // We are using Vercel edge function for this endpoint
    runtime: "edge",
};
interface RequestPayload {
    prompt: string;
}
const handler = async (req: Request, res: Response): Promise<Response> => {
    const { prompt } = (await req.json()) as RequestPayload;
    if (!prompt) {
        return new Response("No prompt in the request", { status: 400 });
    }
    const payload: OpenAIStreamPayload = {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        stream: true,
    };
    const stream = await OpenAIStream(payload);
    return new Response(stream);
};
export default handler;