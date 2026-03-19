import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import FormEditarCarro from './form';

export default async function EditarCarroPage({ params }: { params: { id: string } }) {
  const carros = await query('SELECT * FROM TAB_CARRO WHERE id = $1', [params.id]);

  if (carros.length === 0) {
    notFound();
  }

  return <FormEditarCarro carro={carros[0]} />;
}