import { useState } from "react";
import { Bot, CheckCircle2, Copy, Loader2, Send, Sparkles } from "lucide-react";

import Button from "../../../components/ui/Button";
import DashboardErrorBanner from "./DashboardErrorBanner";
import DashboardSection from "./DashboardSection";
import { genAiService } from "../genAiService";

const defaultPrompts = [
  "Ringkas risiko pendidikan utama dan rekomendasi intervensinya.",
  "Buat prioritas bantuan pendidikan berdasarkan data yang tersedia.",
  "Apa data tambahan yang perlu dicek sebelum mengambil keputusan?",
];

export default function GenAiPanel({
  title = "Gen AI Pintarin",
  description = "Asisten analisis pendidikan berbasis Gemini.",
  context,
  starterPrompts = defaultPrompts,
}) {
  const [message, setMessage] = useState(starterPrompts[0] || "");
  const [reply, setReply] = useState("");
  const [model, setModel] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const canSubmit = message.trim().length >= 3 && !isSubmitting;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setReply("");
    setNotice("");
    setIsCopied(false);

    try {
      const data = await genAiService.chat({
        message: message.trim(),
        context,
      });

      setReply(data?.reply || "");
      setModel(data?.model || "");
      setNotice(data?.review_notice || "");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Gen AI belum bisa memproses pertanyaan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!reply || !navigator.clipboard) return;

    await navigator.clipboard.writeText(reply);
    setIsCopied(true);

    window.setTimeout(() => setIsCopied(false), 1600);
  };

  return (
    <DashboardSection badge="Gen AI" title={title} description={description}>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-white/70 bg-white/44 p-4 ring-1 ring-white/40 backdrop-blur-2xl sm:p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#5EEAD4]/18 text-[#0F766E]">
              <Bot size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-[#102A43]">
                Tanya Gen AI
              </p>
              <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">
                Model memakai konteks dashboard aktif.
              </p>
            </div>
          </div>

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={7}
            maxLength={2000}
            className="w-full resize-none rounded-[1.35rem] border border-white/70 bg-white/72 p-4 text-sm font-medium leading-6 text-[#102A43] outline-none ring-1 ring-white/40 transition placeholder:text-[#94A3B8] focus:border-[#5EEAD4] focus:ring-4 focus:ring-[#5EEAD4]/20"
            placeholder="Tulis pertanyaan analisis..."
          />

          <div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-[#94A3B8]">
            <span>{message.length}/2000</span>
            <span>{model || "Gemini"}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setMessage(prompt)}
                className="rounded-full border border-[#5EEAD4]/35 bg-[#5EEAD4]/12 px-3 py-1.5 text-xs font-extrabold text-[#0F766E] transition hover:bg-[#5EEAD4]/20"
              >
                {prompt}
              </button>
            ))}
          </div>

          <Button
            type="submit"
            className="mt-5 w-full justify-center"
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Memproses
              </>
            ) : (
              <>
                <Send size={17} />
                Kirim
              </>
            )}
          </Button>
        </form>

        <div className="min-h-[24rem] rounded-[1.5rem] border border-white/70 bg-white/50 p-4 ring-1 ring-white/40 backdrop-blur-2xl sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/70 text-[#0F766E] ring-1 ring-white/60">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#102A43]">
                  Jawaban
                </p>
                {notice && (
                  <p className="mt-1 text-xs font-medium leading-5 text-[#64748B]">
                    {notice}
                  </p>
                )}
              </div>
            </div>

            {reply && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopy}
              >
                {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {isCopied ? "Disalin" : "Salin"}
              </Button>
            )}
          </div>

          {errorMessage && (
            <DashboardErrorBanner
              title="Gen AI belum bisa menjawab."
              description={errorMessage}
            />
          )}

          {!errorMessage && !reply && (
            <div className="flex min-h-[17rem] items-center justify-center rounded-[1.35rem] border border-dashed border-[#5EEAD4]/45 bg-[#ECFEFF]/34 p-6 text-center">
              <p className="max-w-sm text-sm font-medium leading-6 text-[#64748B]">
                Jawaban akan muncul di sini setelah pertanyaan dikirim.
              </p>
            </div>
          )}

          {reply && (
            <div className="whitespace-pre-wrap rounded-[1.35rem] border border-[#5EEAD4]/35 bg-[#F8FAFC]/80 p-4 text-sm font-medium leading-7 text-[#334155]">
              {reply}
            </div>
          )}
        </div>
      </div>
    </DashboardSection>
  );
}
