import React from 'react';

// Importando ícones existentes
import { ChestIcon } from './icons/ChestIcon';
import { DoorIcon } from './icons/DoorIcon';
import { GearsIcon } from './icons/GearsIcon';
import { GemsIcon } from './icons/GemsIcon';
import { GoldIcon } from './icons/GoldIcon';
import { HeartIcon } from './icons/HeartIcon';
import { ScrollIcon } from './icons/ScrollIcon';
import { ShopIcon } from './icons/ShopIcon';
import { TableIcon } from './icons/TableIcon';
import { ToolsIcon } from './icons/ToolsIcon';

// Novos ícones baseados nos SVGs disponíveis
const ConfigIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z" fill={color}/>
  </svg>
);

const CreationIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill={color}/>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

const DiamondIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 2l2 6h8l2-6H6zM5 9l7 13 7-13H5z" fill={color}/>
  </svg>
);

const EquipmentIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6.92 5H5l9 9 1.92-1.92c.05-.05.1-.1.13-.15L19 9l-4-4-2.93 2.93c-.05.03-.1.08-.15.13L10 6.08V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v.08L5.08 7 5 7.92 6.92 5z" fill={color}/>
    <path d="M14.5 13.5L9 19H5v-4l5.5-5.5 4 4z" fill={color}/>
  </svg>
);

const InventoryIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4h16v2H4V4zm0 4h16v12H4V8zm2 2v8h12v-8H6z" fill={color}/>
    <rect x="8" y="12" width="2" height="2" fill={color}/>
    <rect x="11" y="12" width="2" height="2" fill={color}/>
    <rect x="14" y="12" width="2" height="2" fill={color}/>
  </svg>
);

const MapIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" fill={color}/>
  </svg>
);

const MissionIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color}/>
  </svg>
);

const MonsterIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill={color}/>
    <circle cx="9" cy="9" r="1.5" fill="white"/>
    <circle cx="15" cy="9" r="1.5" fill="white"/>
    <path d="M8 13h8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NPCIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="6" r="4" fill={color}/>
    <path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z" fill={color}/>
  </svg>
);

const ExitIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2z" fill={color}/>
  </svg>
);

const MenuIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z" fill={color}/>
  </svg>
);

const CloseIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill={color}/>
  </svg>
);

const ChevronDownIcon = ({ size = 24, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6-6-6 1.41-1.42z" fill={color}/>
  </svg>
);

// Mapeamento de ícones
const iconMap = {
  // Ícones existentes
  chest: ChestIcon,
  door: DoorIcon,
  gears: GearsIcon,
  gems: GemsIcon,
  gold: GoldIcon,
  heart: HeartIcon,
  scroll: ScrollIcon,
  shop: ShopIcon,
  table: TableIcon,
  tools: ToolsIcon,
  
  // Novos ícones baseados nos SVGs
  config: ConfigIcon,
  configuracao: ConfigIcon,
  creation: CreationIcon,
  criacoes: CreationIcon,
  diamond: DiamondIcon,
  diamante: DiamondIcon,
  equipment: EquipmentIcon,
  equipamentos: EquipmentIcon,
  inventory: InventoryIcon,
  inventario: InventoryIcon,
  map: MapIcon,
  mapa: MapIcon,
  mission: MissionIcon,
  missoes: MissionIcon,
  monster: MonsterIcon,
  monstros: MonsterIcon,
  npc: NPCIcon,
  exit: ExitIcon,
  sair: ExitIcon,
  menu: MenuIcon,
  close: CloseIcon,
  'chevron-down': ChevronDownIcon,
  
  // Aliases para facilitar o uso
  settings: ConfigIcon,
  add: CreationIcon,
  plus: CreationIcon,
  bag: InventoryIcon,
  backpack: InventoryIcon,
  quest: MissionIcon,
  star: MissionIcon,
  enemy: MonsterIcon,
  creature: MonsterIcon,
  person: NPCIcon,
  character: NPCIcon,
  logout: ExitIcon,
  leave: ExitIcon,
  hamburger: MenuIcon,
  x: CloseIcon,
  down: ChevronDownIcon,
  expand: ChevronDownIcon
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = "currentColor", className = "" }) => {
  const IconComponent = iconMap[name.toLowerCase() as keyof typeof iconMap];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found. Available icons:`, Object.keys(iconMap));
    return (
      <div 
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.6, color }}>?</span>
      </div>
    );
  }
  
  return <IconComponent size={size} color={color} className={className} />;
};

export default Icon;

// Export individual icons for direct use
export {
  ChestIcon,
  DoorIcon,
  GearsIcon,
  GemsIcon,
  GoldIcon,
  HeartIcon,
  ScrollIcon,
  ShopIcon,
  TableIcon,
  ToolsIcon,
  ConfigIcon,
  CreationIcon,
  DiamondIcon,
  EquipmentIcon,
  InventoryIcon,
  MapIcon,
  MissionIcon,
  MonsterIcon,
  NPCIcon,
  ExitIcon,
  MenuIcon,
  CloseIcon,
  ChevronDownIcon
};