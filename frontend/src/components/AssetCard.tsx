import { Link } from 'react-router-dom';

interface AssetCardProps {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  linkTo: string;
}

export function AssetCard({ id, name, line1, line2, linkTo }: AssetCardProps) {
  return (
    <Link to={linkTo}>
      <div className="bg-background/50 p-3 rounded-lg border border-gray-700 hover:border-primary transition-colors">
        <h4 className="font-bold text-text-base truncate">{name}</h4>
        <p className="text-sm text-text-muted">{line1}</p>
        {line2 && <p className="text-xs text-text-muted/70">{line2}</p>}
      </div>
    </Link>
  );
}