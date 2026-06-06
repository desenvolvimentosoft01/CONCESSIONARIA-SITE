import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import FormEditarCarro from './form';

export default async function EditarCarroPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  let carros: any[] = [];
  try {
    carros = await query('SELECT * FROM TAB_CARRO WHERE id = $1', [id]);
  } catch (error) {
    console.error('Erro ao carregar carro para edição:', error);
    notFound();
  }

  if (carros.length === 0) {
    notFound();
  }

  return <FormEditarCarro carro={carros[0]} />;
}