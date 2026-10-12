import Image from 'next/image';
import { loadCertificates } from '@/lib/content';

export async function CertificateGrid() {
  const certificates = await loadCertificates();

  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {certificates.map((cert) => (
        <li
          key={cert.id}
          className="flex flex-col items-center rounded-[2rem] border border-ink/5 bg-white p-8 text-center transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgb(23_32_15/0.3)]"
        >
          <div className="relative h-28 w-full">
            {cert.image && (
              <Image src={cert.image} alt={cert.name} fill sizes="240px" className="object-contain" />
            )}
          </div>
          <h3 className="mt-6 font-semibold">{cert.name}</h3>
          {cert.note && <p className="mt-1 text-sm text-ink/55">{cert.note}</p>}
        </li>
      ))}
    </ul>
  );
}
