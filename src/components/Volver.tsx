import Link from "next/link";

export default function Volver({ href }: { href: string }) {
  return (
    <Link href={href} className="mb-4 inline-block text-sm text-blue-700 hover:underline">
      Volver a mis clases
    </Link>
  );
}
