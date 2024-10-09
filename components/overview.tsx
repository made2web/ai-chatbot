import { motion } from "framer-motion";
import Link from "next/link";

import { LogoOpenAI, MessageIcon, VercelIcon } from "./icons";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-[500px] mt-20 mx-4 md:mx-0"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border rounded-lg p-6 flex flex-col gap-4 text-zinc-500 text-sm dark:text-zinc-400 dark:border-zinc-700">
        <h2 className="text-lg font-semibold">Assistente RH Made2Web</h2>
        <p>
          Olá! Sou o assistente virtual da equipa de gestão de recursos humanos
          da Made2Web. Estou aqui para ajudar nos procedimentos administrativos,
          como marcar férias, submeter despesas, etc.
        </p>
        <p>Comece por fazer uma pergunta.</p>
      </div>
    </motion.div>
  );
};
