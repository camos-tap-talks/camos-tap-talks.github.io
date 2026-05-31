import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Children, isValidElement } from "react";

type Props = {
  content: string;
  variant?: "inline" | "block";
  className?: string;
};

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a ?? []), "href", "title", "target", "rel"],
    img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "title", "width", "height", "align"],
    p: [...(defaultSchema.attributes?.p ?? []), "align"],
    div: [...(defaultSchema.attributes?.div ?? []), "align"],
    figure: [...(defaultSchema.attributes?.figure ?? []), "align"],
    figcaption: [...(defaultSchema.attributes?.figcaption ?? []), "align"],
    table: [...(defaultSchema.attributes?.table ?? []), "align"],
    th: [...(defaultSchema.attributes?.th ?? []), "align", "colspan", "rowspan"],
    td: [...(defaultSchema.attributes?.td ?? []), "align", "colspan", "rowspan"],
  },
};

export default function MarkdownText({ content, variant = "block", className }: Props) {
  if (variant === "inline") {
    return (
      <span className={className}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
          components={{
            p: ({ children }) => <span>{children}</span>,
            code: ({ children }) => (
              <code className="rounded bg-[color-mix(in_srgb,var(--accent)_12%,white)] px-1.5 py-0.5 text-[0.92em] text-[var(--foreground)]">
                {children}
              </code>
            ),
            a: ({ href, children, ...props }) => (
              <a href={href} {...props}>
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </span>
    );
  }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          p: ({ children }) => {
            const isInlineAlignedImageNode = (node: unknown) => {
              if (!isValidElement(node)) return false;
              if (typeof node.props !== "object" || node.props === null) return false;

              const props = node.props as { align?: unknown; "data-inline-align"?: unknown };
              const align = typeof props.align === "string" ? props.align : "";
              const dataInline = props["data-inline-align"];
              return align === "inline" || dataInline === "true";
            };

            const isIgnorableNode = (node: unknown) => {
              if (typeof node === "string") return node.trim().length === 0;
              if (!isValidElement(node)) return false;
              return node.type === "br";
            };

            const nodes = Children.toArray(children);
            const hasInlineImage = nodes.some((node) => isInlineAlignedImageNode(node));
            const hasNonInlineContent = nodes.some((node) => !isIgnorableNode(node) && !isInlineAlignedImageNode(node));

            return (
              <p className={`mb-3 last:mb-0 ${hasInlineImage && !hasNonInlineContent ? "text-center" : ""}`.trim()}>
                {children}
              </p>
            );
          },
          ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="mb-3 border-l-2 border-[var(--line)] pl-3 italic text-[color-mix(in_srgb,var(--muted)_88%,black)] last:mb-0">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="mb-3 overflow-x-auto last:mb-0">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[color-mix(in_srgb,var(--accent)_10%,white)]">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-[var(--line)]">{children}</tr>,
          th: ({ children }) => <th className="px-2 py-1 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-2 py-1 align-top">{children}</td>,
          pre: ({ children }) => (
            <pre className="my-4 overflow-x-auto rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm">
              {children}
            </pre>
          ),
          code: ({ children }) => (
            <code className="rounded bg-[color-mix(in_srgb,var(--accent)_12%,white)] px-1.5 py-0.5 text-[0.92em] text-[var(--foreground)]">
              {children}
            </code>
          ),
          img: ({ src, alt, width, height, ...props }) => {
            const align = typeof (props as { align?: unknown }).align === "string"
              ? ((props as { align?: string }).align ?? "")
              : "";
            const isInline = align === "inline";
            const alignClass = isInline
              ? "inline-block w-[48%] max-w-[360px] align-top"
              : align === "center"
                ? "mx-auto block"
                : align === "right"
                  ? "ml-auto block"
                  : "block";
            const spacingClass = isInline ? "my-2 mr-2" : "my-4";
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src ?? ""}
                alt={alt ?? ""}
                width={isInline ? undefined : (typeof width === "string" || typeof width === "number" ? width : undefined)}
                height={typeof height === "string" || typeof height === "number" ? height : undefined}
                data-inline-align={isInline ? "true" : undefined}
                className={`${spacingClass} h-auto max-w-full ${alignClass}`.trim()}
              />
            );
          },
          figure: ({ children, ...props }) => {
            const align = typeof (props as { align?: unknown }).align === "string"
              ? ((props as { align?: string }).align ?? "")
              : "";
            const alignClass = align === "center" ? "mx-auto text-center" : align === "right" ? "ml-auto text-right" : "text-left";
            return <figure className={`my-4 ${alignClass}`.trim()}>{children}</figure>;
          },
          figcaption: ({ children }) => (
            <figcaption className="mt-2 text-xs text-[var(--muted)]">{children}</figcaption>
          ),
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              {...props}
              className="underline decoration-[color-mix(in_srgb,var(--accent)_55%,transparent)] underline-offset-4 hover:decoration-[var(--accent)]"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
