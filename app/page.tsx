'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Definindo o tipo do item para o TypeScript
interface ItemCompra {
  id: number
  nome: string
  comprado: boolean
  quantidade: number // Adicionado
}

export default function Home() {
  const [itens, setItens] = useState<ItemCompra[]>([])
  const [novoItem, setNovoItem] = useState('')
  const [quantidade, setQuantidade] = useState(1) // Estado para controlar a quantidade

  // 1. FUNÇÃO PARA BUSCAR ITENS NO BANCO (GET)
  async function buscarItens() {
    const { data, error } = await supabase
      .from('itens_compra')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) console.error('Erro ao buscar:', error)
    else setItens(data || [])
  }

  useEffect(() => {
    buscarItens()
  }, [])

  // 2. FUNÇÃO PARA ADICIONAR ITEM (INSERT)
  async function adicionarItem(nome: string, qtd: number) {
    if (!nome.trim()) return

    const { error } = await supabase
      .from('itens_compra')
      .insert([{ nome, comprado: false, quantidade: qtd }]) // Agora envia a quantidade

    if (error) {
      console.error('Erro ao inserir:', error)
    } else {
      setNovoItem('')
      setQuantidade(1) // Reseta a quantidade para 1
      buscarItens()
    }
  }

  // 3. FUNÇÃO PARA MARCAR COMO COMPRADO (UPDATE)
  async function alternarComprado(id: number, statusAtual: boolean) {
    const { error } = await supabase
      .from('itens_compra')
      .update({ comprado: !statusAtual })
      .eq('id', id)

    if (error) console.error('Erro ao atualizar:', error)
    else buscarItens()
  }

  // 4. FUNÇÃO PARA EXCLUIR ITEM (DELETE)
  async function excluirItem(id: number) {
    const { error } = await supabase
      .from('itens_compra')
      .delete()
      .eq('id', id)

    if (error) console.error('Erro ao excluir:', error)
    else buscarItens()
  }

  const sugestoes = ['Arroz', 'Feijão', 'Leite', 'Sabão', 'Detergente']

  return (
    <main className="min-h-screen bg-orange-50 p-8 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-md bg-white p-6 shadow-xl rounded-2xl dark:bg-zinc-800">
        
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Lista de Compras</h1>
          <p className="text-sm text-zinc-500 italic">Facilitando o dia a dia doméstico</p>
        </header>

        {/* Campo de Entrada e Quantidade */}
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            placeholder="O que comprar?" 
            className="flex-1 border rounded-md px-3 py-2 dark:bg-zinc-700 dark:border-zinc-600 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            type="number" 
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            min="1"
            className="w-16 border rounded-md px-2 py-2 dark:bg-zinc-700 dark:border-zinc-600 outline-none focus:ring-2 focus:ring-blue-500"
            title="Quantidade"
          />
          <button 
            onClick={() => adicionarItem(novoItem, quantidade)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>

        {/* Botões de Sugestão */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-zinc-400 uppercase mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {sugestoes.map((s) => (
              <button
                key={s}
                onClick={() => adicionarItem(s, 1)}
                className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-3 py-1 rounded-full dark:bg-zinc-700 dark:text-zinc-300"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Itens do Banco */}
        <ul className="space-y-3">
          {itens.map((item) => (
            <li key={item.id} className="flex items-center justify-between border-b pb-2 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={item.comprado}
                  onChange={() => alternarComprado(item.id, item.comprado)}
                  className="h-5 w-5 cursor-pointer" 
                />
                <div className="flex flex-col">
                   <span className={item.comprado ? 'line-through text-zinc-400' : 'font-medium'}>
                    {item.nome}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Qtd: {item.quantidade || 1}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => excluirItem(item.id)}
                className="text-red-500 hover:text-red-700 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}