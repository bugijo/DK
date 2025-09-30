import React, { useEffect, useState } from 'react';
import './VisualEffects.css';

export enum EffectType {
  DAMAGE = 'damage',
  HEALING = 'healing',
  CRITICAL = 'critical',
  SPELL_CAST = 'spell_cast',
  LEVEL_UP = 'level_up',
  DICE_ROLL = 'dice_roll',
  SUCCESS = 'success',
  FAILURE = 'failure',
  NOTIFICATION = 'notification'
}

export interface VisualEffect {
  id: string;
  type: EffectType;
  x: number;
  y: number;
  text?: string;
  value?: number;
  duration?: number;
  color?: string;
}

interface VisualEffectsProps {
  effects: VisualEffect[];
  onEffectComplete: (id: string) => void;
}

const VisualEffects: React.FC<VisualEffectsProps> = ({ effects, onEffectComplete }) => {
  return (
    <div className="visual-effects-container">
      {effects.map(effect => (
        <EffectRenderer
          key={effect.id}
          effect={effect}
          onComplete={() => onEffectComplete(effect.id)}
        />
      ))}
    </div>
  );
};

interface EffectRendererProps {
  effect: VisualEffect;
  onComplete: () => void;
}

const EffectRenderer: React.FC<EffectRendererProps> = ({ effect, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // Define a classe de animação baseada no tipo de efeito
    const getAnimationClass = (type: EffectType): string => {
      switch (type) {
        case EffectType.DAMAGE:
          return 'effect-damage';
        case EffectType.HEALING:
          return 'effect-healing';
        case EffectType.CRITICAL:
          return 'effect-critical';
        case EffectType.SPELL_CAST:
          return 'effect-spell';
        case EffectType.LEVEL_UP:
          return 'effect-levelup';
        case EffectType.DICE_ROLL:
          return 'effect-dice';
        case EffectType.SUCCESS:
          return 'effect-success';
        case EffectType.FAILURE:
          return 'effect-failure';
        case EffectType.NOTIFICATION:
          return 'effect-notification';
        default:
          return 'effect-default';
      }
    };

    setAnimationClass(getAnimationClass(effect.type));

    // Remove o efeito após a duração especificada
    const duration = effect.duration || 2000;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Aguarda a animação de fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [effect, onComplete]);

  if (!isVisible) {
    return null;
  }

  const getEffectText = (): string => {
    if (effect.text) return effect.text;
    
    switch (effect.type) {
      case EffectType.DAMAGE:
        return effect.value ? `-${effect.value}` : 'Dano!';
      case EffectType.HEALING:
        return effect.value ? `+${effect.value}` : 'Cura!';
      case EffectType.CRITICAL:
        return 'CRÍTICO!';
      case EffectType.SPELL_CAST:
        return 'Magia!';
      case EffectType.LEVEL_UP:
        return 'LEVEL UP!';
      case EffectType.DICE_ROLL:
        return effect.value ? `🎲 ${effect.value}` : '🎲';
      case EffectType.SUCCESS:
        return '✓ Sucesso!';
      case EffectType.FAILURE:
        return '✗ Falha!';
      case EffectType.NOTIFICATION:
        return '📢';
      default:
        return '';
    }
  };

  const getEffectColor = (): string => {
    if (effect.color) return effect.color;
    
    switch (effect.type) {
      case EffectType.DAMAGE:
        return '#ff4444';
      case EffectType.HEALING:
        return '#44ff44';
      case EffectType.CRITICAL:
        return '#ffaa00';
      case EffectType.SPELL_CAST:
        return '#8844ff';
      case EffectType.LEVEL_UP:
        return '#ffdd00';
      case EffectType.DICE_ROLL:
        return '#4488ff';
      case EffectType.SUCCESS:
        return '#00ff88';
      case EffectType.FAILURE:
        return '#ff6666';
      case EffectType.NOTIFICATION:
        return '#88ccff';
      default:
        return '#ffffff';
    }
  };

  return (
    <div
      className={`visual-effect ${animationClass} ${!isVisible ? 'fade-out' : ''}`}
      style={{
        left: `${effect.x}px`,
        top: `${effect.y}px`,
        color: getEffectColor(),
        '--effect-color': getEffectColor()
      } as React.CSSProperties}
    >
      <span className="effect-text">{getEffectText()}</span>
      {effect.type === EffectType.CRITICAL && (
        <div className="critical-burst"></div>
      )}
      {effect.type === EffectType.SPELL_CAST && (
        <div className="spell-particles"></div>
      )}
      {effect.type === EffectType.LEVEL_UP && (
        <div className="levelup-glow"></div>
      )}
    </div>
  );
};

// Hook para gerenciar efeitos visuais
export const useVisualEffects = () => {
  const [effects, setEffects] = useState<VisualEffect[]>([]);

  const addEffect = (effect: Omit<VisualEffect, 'id'>) => {
    const newEffect: VisualEffect = {
      ...effect,
      id: `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setEffects(prev => [...prev, newEffect]);
  };

  const removeEffect = (id: string) => {
    setEffects(prev => prev.filter(effect => effect.id !== id));
  };

  const clearAllEffects = () => {
    setEffects([]);
  };

  // Métodos de conveniência
  const showDamage = (x: number, y: number, value: number) => {
    addEffect({
      type: EffectType.DAMAGE,
      x,
      y,
      value,
      duration: 1500
    });
  };

  const showHealing = (x: number, y: number, value: number) => {
    addEffect({
      type: EffectType.HEALING,
      x,
      y,
      value,
      duration: 1500
    });
  };

  const showCritical = (x: number, y: number) => {
    addEffect({
      type: EffectType.CRITICAL,
      x,
      y,
      duration: 2000
    });
  };

  const showSpellCast = (x: number, y: number, spellName?: string) => {
    addEffect({
      type: EffectType.SPELL_CAST,
      x,
      y,
      text: spellName,
      duration: 2500
    });
  };

  const showLevelUp = (x: number, y: number) => {
    addEffect({
      type: EffectType.LEVEL_UP,
      x,
      y,
      duration: 3000
    });
  };

  const showDiceRoll = (x: number, y: number, result: number) => {
    addEffect({
      type: EffectType.DICE_ROLL,
      x,
      y,
      value: result,
      duration: 2000
    });
  };

  const showSuccess = (x: number, y: number, message?: string) => {
    addEffect({
      type: EffectType.SUCCESS,
      x,
      y,
      text: message,
      duration: 1500
    });
  };

  const showFailure = (x: number, y: number, message?: string) => {
    addEffect({
      type: EffectType.FAILURE,
      x,
      y,
      text: message,
      duration: 1500
    });
  };

  const showNotification = (x: number, y: number, message: string) => {
    addEffect({
      type: EffectType.NOTIFICATION,
      x,
      y,
      text: message,
      duration: 2000
    });
  };

  return {
    effects,
    addEffect,
    removeEffect,
    clearAllEffects,
    showDamage,
    showHealing,
    showCritical,
    showSpellCast,
    showLevelUp,
    showDiceRoll,
    showSuccess,
    showFailure,
    showNotification
  };
};

export default VisualEffects;