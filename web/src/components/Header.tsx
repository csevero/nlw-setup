import { Plus, X } from 'phosphor-react';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import logoImage from '../assets/logo.svg';
import { NewHabitForm } from './NewHabitForm';

export function Header() {
  return (
    <div className="w-full max-w-3xl mx-auto flex items-center justify-between">
      <img src={logoImage} alt="Habits" />

      <Dialog.Root>
        <Dialog.Trigger
          type="button"
          className="border border-violet-500 font-semibold rounded-lg px-6 py-4 flex flex-row items-center gap-3 hover:border-violet-300"
        >
          <Plus size={20} className="text-violet-500" />
          Novo hábito
        </Dialog.Trigger>

        {/* Portal is a feature to render some element outside of actual, for example, instead of render the modal on Header, using portal we'll render it on main element  */}
        <Dialog.Portal>
          <Dialog.Overlay className="w-screen h-screen bg-black/80 fixed inset-0" />
          {/* To set % with tailwind we can set fraction, like 1/2 to 50%, to use negative values, just use - in front of your tag */}
          <Dialog.Content className="absolute p-10 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Dialog.Close className='absolute right-6 top-6 text-zinc-400 hover:text-zinc-200'>
              <X size={24} aria-label="Fechar" />
            </Dialog.Close>
            <Dialog.Title className="text-3xl leading-tight font-extrabold">
              Criar hábito
            </Dialog.Title>

            <NewHabitForm />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
