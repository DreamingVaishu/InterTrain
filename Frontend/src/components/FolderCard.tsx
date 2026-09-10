import { motion } from 'motion/react';
import { HistoryFolder } from '../types';

interface FolderCardProps {
  key?: string | number;
  folder: HistoryFolder;
  onClick: () => void;
}

export function FolderCard({ folder, onClick }: FolderCardProps) {
  return (
    <div className="relative flex flex-col group cursor-pointer" onClick={onClick}>
      {/* Top row: folder tab on left, attempt count badge on right */}
      <div className="flex items-end justify-between px-1">
        {/* Folder tab */}
        <div
          className="w-32 h-6 bg-gradient-to-r from-[#2c6da8] to-[#255e96] rounded-t-xl transition-all duration-200 group-hover:brightness-110"
          style={{
            clipPath: 'polygon(0% 0%, 82% 0%, 100% 100%, 0% 100%)',
          }}
        />

        {/* Counter displayed on top right as in design */}
        <div className="text-sm font-semibold text-neutral-700 pb-0.5 pr-2 select-none group-hover:text-neutral-900 transition-colors">
          {folder.count}
        </div>
      </div>

      {/* Main folder body */}
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-44 rounded-2xl p-5 bg-gradient-to-b from-[#2e6ea9] via-[#245b8f] to-[#1d4b76] shadow-md border border-[#3b7bb5]/30 flex flex-col justify-between transition-all duration-200 group-hover:shadow-xl group-hover:border-[#4f95d8]/50"
      >
        <div>
          <h3 className="text-xl font-bold text-white tracking-wide drop-shadow-sm">
            {folder.title}
          </h3>
          <p className="text-xs text-blue-100/70 mt-1 line-clamp-2">
            {folder.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[11px] font-medium text-blue-100/90 tracking-wider uppercase">
            {folder.attempts.length} {folder.attempts.length === 1 ? 'Attempt' : 'Attempts'}
          </span>
          <span className="text-xs text-blue-200 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View review →
          </span>
        </div>
      </motion.div>
    </div>
  );
}
