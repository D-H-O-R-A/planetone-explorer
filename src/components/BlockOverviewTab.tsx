import { Block } from "@/services/api";
import BlockDetailsGrid from "./BlockDetailsGrid";

interface BlockOverviewTabProps {
  block: Block;
  blockSize: number | undefined;
  copiedField: string | null;
  copyToClipboard: (text: string, field: string) => void;
}

const BlockOverviewTab = ({ block, blockSize, copiedField, copyToClipboard }: BlockOverviewTabProps) => {
  return (
    <div className="bg-card/40 backdrop-blur-xl border border-border rounded-2xl p-5 md:p-6 space-y-5 shadow-lg">
      <BlockDetailsGrid 
        block={block}
        blockSize={blockSize}
        copiedField={copiedField}
        copyToClipboard={copyToClipboard}
      />
    </div>
  );
};

export default BlockOverviewTab;
