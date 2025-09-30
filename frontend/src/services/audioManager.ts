/**
 * Sistema de Gerenciamento de Áudio para Imersão em RPG
 * Fornece efeitos sonoros contextuais para melhorar a experiência de jogo
 */

export enum SoundType {
  // Sons de Interface
  BUTTON_CLICK = 'button_click',
  NOTIFICATION = 'notification',
  ERROR = 'error',
  SUCCESS = 'success',
  
  // Sons de Combate
  SWORD_ATTACK = 'sword_attack',
  BOW_SHOT = 'bow_shot',
  SPELL_CAST = 'spell_cast',
  CRITICAL_HIT = 'critical_hit',
  DAMAGE_TAKEN = 'damage_taken',
  HEALING = 'healing',
  
  // Sons Ambientais
  TAVERN_AMBIENT = 'tavern_ambient',
  FOREST_AMBIENT = 'forest_ambient',
  DUNGEON_AMBIENT = 'dungeon_ambient',
  CITY_AMBIENT = 'city_ambient',
  
  // Sons de Dados
  DICE_ROLL = 'dice_roll',
  DICE_CRITICAL = 'dice_critical',
  DICE_FUMBLE = 'dice_fumble',
  
  // Sons de Chat e Comunicação
  MESSAGE_RECEIVED = 'message_received',
  WHISPER = 'whisper',
  ANNOUNCEMENT = 'announcement',
  
  // Sons de Mapa
  TOKEN_MOVE = 'token_move',
  TOKEN_SELECT = 'token_select',
  MAP_ZOOM = 'map_zoom'
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  musicVolume: number;
  enabled: boolean;
}

export interface SoundConfig {
  url: string;
  volume?: number;
  loop?: boolean;
  category: 'sfx' | 'ambient' | 'music';
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundType, HTMLAudioElement> = new Map();
  private currentAmbient: HTMLAudioElement | null = null;
  private settings: AudioSettings;
  private initialized = false;

  constructor() {
    this.settings = this.loadSettings();
    this.initializeAudioContext();
  }

  private loadSettings(): AudioSettings {
    const saved = localStorage.getItem('dungeon-keeper-audio-settings');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      ambientVolume: 0.5,
      musicVolume: 0.6,
      enabled: true
    };
  }

  private saveSettings(): void {
    localStorage.setItem('dungeon-keeper-audio-settings', JSON.stringify(this.settings));
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadSounds();
      this.initialized = true;
    } catch (error) {
      console.warn('AudioContext não suportado:', error);
    }
  }

  private async loadSounds(): Promise<void> {
    const soundConfigs: Record<SoundType, SoundConfig> = {
      // Sons de Interface (usando Web Audio API para gerar tons)
      [SoundType.BUTTON_CLICK]: { url: '', volume: 0.3, category: 'sfx' },
      [SoundType.NOTIFICATION]: { url: '', volume: 0.5, category: 'sfx' },
      [SoundType.ERROR]: { url: '', volume: 0.6, category: 'sfx' },
      [SoundType.SUCCESS]: { url: '', volume: 0.5, category: 'sfx' },
      
      // Sons de Combate
      [SoundType.SWORD_ATTACK]: { url: '', volume: 0.7, category: 'sfx' },
      [SoundType.BOW_SHOT]: { url: '', volume: 0.6, category: 'sfx' },
      [SoundType.SPELL_CAST]: { url: '', volume: 0.8, category: 'sfx' },
      [SoundType.CRITICAL_HIT]: { url: '', volume: 0.9, category: 'sfx' },
      [SoundType.DAMAGE_TAKEN]: { url: '', volume: 0.7, category: 'sfx' },
      [SoundType.HEALING]: { url: '', volume: 0.6, category: 'sfx' },
      
      // Sons Ambientais
      [SoundType.TAVERN_AMBIENT]: { url: '', volume: 0.4, loop: true, category: 'ambient' },
      [SoundType.FOREST_AMBIENT]: { url: '', volume: 0.4, loop: true, category: 'ambient' },
      [SoundType.DUNGEON_AMBIENT]: { url: '', volume: 0.4, loop: true, category: 'ambient' },
      [SoundType.CITY_AMBIENT]: { url: '', volume: 0.4, loop: true, category: 'ambient' },
      
      // Sons de Dados
      [SoundType.DICE_ROLL]: { url: '', volume: 0.6, category: 'sfx' },
      [SoundType.DICE_CRITICAL]: { url: '', volume: 0.8, category: 'sfx' },
      [SoundType.DICE_FUMBLE]: { url: '', volume: 0.7, category: 'sfx' },
      
      // Sons de Chat
      [SoundType.MESSAGE_RECEIVED]: { url: '', volume: 0.4, category: 'sfx' },
      [SoundType.WHISPER]: { url: '', volume: 0.3, category: 'sfx' },
      [SoundType.ANNOUNCEMENT]: { url: '', volume: 0.7, category: 'sfx' },
      
      // Sons de Mapa
      [SoundType.TOKEN_MOVE]: { url: '', volume: 0.3, category: 'sfx' },
      [SoundType.TOKEN_SELECT]: { url: '', volume: 0.2, category: 'sfx' },
      [SoundType.MAP_ZOOM]: { url: '', volume: 0.2, category: 'sfx' }
    };

    // Para este MVP, vamos gerar sons proceduralmente usando Web Audio API
    for (const [soundType, config] of Object.entries(soundConfigs)) {
      const audio = this.createProceduralSound(soundType as SoundType, config);
      if (audio) {
        this.sounds.set(soundType as SoundType, audio);
      }
    }
  }

  private createProceduralSound(type: SoundType, config: SoundConfig): HTMLAudioElement | null {
    if (!this.audioContext) return null;

    try {
      // Cria um buffer de áudio procedural baseado no tipo de som
      const duration = config.loop ? 10 : 0.5; // 10s para ambient, 0.5s para SFX
      const sampleRate = this.audioContext.sampleRate;
      const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
      const data = buffer.getChannelData(0);

      // Gera diferentes tipos de ondas baseado no som
      this.generateWaveform(type, data, sampleRate, duration);

      // Converte para blob e cria elemento audio
      const audioBlob = this.bufferToWave(buffer);
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      audio.volume = (config.volume || 0.5) * this.getVolumeMultiplier(config.category);
      audio.loop = config.loop || false;
      
      return audio;
    } catch (error) {
      console.warn(`Erro ao criar som ${type}:`, error);
      return null;
    }
  }

  private generateWaveform(type: SoundType, data: Float32Array, sampleRate: number, duration: number): void {
    const length = data.length;
    
    switch (type) {
      case SoundType.BUTTON_CLICK:
        // Som de clique: impulso rápido
        for (let i = 0; i < length * 0.1; i++) {
          data[i] = Math.random() * 0.3 * Math.exp(-i / (sampleRate * 0.05));
        }
        break;
        
      case SoundType.DICE_ROLL:
        // Som de dados: ruído com modulação
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          data[i] = (Math.random() - 0.5) * 0.4 * Math.exp(-t * 3) * (1 + Math.sin(t * 50));
        }
        break;
        
      case SoundType.SPELL_CAST:
        // Som mágico: frequência crescente
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const freq = 200 + t * 400;
          data[i] = Math.sin(2 * Math.PI * freq * t) * 0.3 * Math.exp(-t * 2);
        }
        break;
        
      case SoundType.SWORD_ATTACK:
        // Som de espada: ruído metálico
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          data[i] = (Math.random() - 0.5) * 0.5 * Math.exp(-t * 4) * Math.sin(t * 1000);
        }
        break;
        
      case SoundType.HEALING:
        // Som de cura: tom suave e ascendente
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const freq = 440 + Math.sin(t * 4) * 100;
          data[i] = Math.sin(2 * Math.PI * freq * t) * 0.2 * (1 - t / duration);
        }
        break;
        
      case SoundType.TAVERN_AMBIENT:
        // Ambiente de taverna: ruído baixo com variações
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          data[i] = (Math.random() - 0.5) * 0.1 * (1 + Math.sin(t * 0.5) * 0.3);
        }
        break;
        
      default:
        // Som genérico: tom simples
        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          data[i] = Math.sin(2 * Math.PI * 440 * t) * 0.2 * Math.exp(-t * 2);
        }
    }
  }

  private bufferToWave(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const data = buffer.getChannelData(0);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  private getVolumeMultiplier(category: 'sfx' | 'ambient' | 'music'): number {
    if (!this.settings.enabled) return 0;
    
    const base = this.settings.masterVolume;
    switch (category) {
      case 'sfx': return base * this.settings.sfxVolume;
      case 'ambient': return base * this.settings.ambientVolume;
      case 'music': return base * this.settings.musicVolume;
      default: return base;
    }
  }

  // Métodos públicos
  public async playSound(type: SoundType, volume?: number): Promise<void> {
    if (!this.initialized || !this.settings.enabled) return;
    
    const sound = this.sounds.get(type);
    if (!sound) return;
    
    try {
      // Clone o áudio para permitir múltiplas reproduções simultâneas
      const audioClone = sound.cloneNode() as HTMLAudioElement;
      
      if (volume !== undefined) {
        audioClone.volume = Math.min(1, volume * this.settings.masterVolume);
      }
      
      await audioClone.play();
      
      // Remove o clone após a reprodução
      audioClone.addEventListener('ended', () => {
        audioClone.remove();
      });
    } catch (error) {
      console.warn(`Erro ao reproduzir som ${type}:`, error);
    }
  }

  public async setAmbientSound(type: SoundType | null): Promise<void> {
    // Para o som ambiente atual
    if (this.currentAmbient) {
      this.currentAmbient.pause();
      this.currentAmbient = null;
    }
    
    // Inicia novo som ambiente se especificado
    if (type && this.settings.enabled) {
      const sound = this.sounds.get(type);
      if (sound && sound.loop) {
        this.currentAmbient = sound;
        try {
          await sound.play();
        } catch (error) {
          console.warn(`Erro ao reproduzir ambiente ${type}:`, error);
        }
      }
    }
  }

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // Atualiza volume dos sons carregados
    this.sounds.forEach((sound, type) => {
      const config = this.getSoundConfig(type);
      sound.volume = (config.volume || 0.5) * this.getVolumeMultiplier(config.category);
    });
    
    // Atualiza som ambiente atual
    if (this.currentAmbient) {
      const type = this.getCurrentAmbientType();
      if (type) {
        const config = this.getSoundConfig(type);
        this.currentAmbient.volume = (config.volume || 0.5) * this.getVolumeMultiplier(config.category);
      }
    }
  }

  private getSoundConfig(type: SoundType): SoundConfig {
    // Retorna configuração padrão baseada no tipo
    const ambientTypes = [SoundType.TAVERN_AMBIENT, SoundType.FOREST_AMBIENT, SoundType.DUNGEON_AMBIENT, SoundType.CITY_AMBIENT];
    
    if (ambientTypes.includes(type)) {
      return { url: '', volume: 0.4, loop: true, category: 'ambient' };
    }
    
    return { url: '', volume: 0.5, category: 'sfx' };
  }

  private getCurrentAmbientType(): SoundType | null {
    const entries = Array.from(this.sounds.entries());
    for (const [type, sound] of entries) {
      if (sound === this.currentAmbient) {
        return type;
      }
    }
    return null;
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public isEnabled(): boolean {
    return this.settings.enabled && this.initialized;
  }

  // Métodos de conveniência para eventos específicos
  public playDiceRoll(result: number, max: number): void {
    if (result === 1) {
      this.playSound(SoundType.DICE_FUMBLE);
    } else if (result === max) {
      this.playSound(SoundType.DICE_CRITICAL);
    } else {
      this.playSound(SoundType.DICE_ROLL);
    }
  }

  public playAttack(weaponType: 'sword' | 'bow' | 'spell', isCritical: boolean = false): void {
    if (isCritical) {
      this.playSound(SoundType.CRITICAL_HIT);
      return;
    }
    
    switch (weaponType) {
      case 'sword':
        this.playSound(SoundType.SWORD_ATTACK);
        break;
      case 'bow':
        this.playSound(SoundType.BOW_SHOT);
        break;
      case 'spell':
        this.playSound(SoundType.SPELL_CAST);
        break;
    }
  }

  public playUISound(action: 'click' | 'success' | 'error' | 'notification'): void {
    switch (action) {
      case 'click':
        this.playSound(SoundType.BUTTON_CLICK);
        break;
      case 'success':
        this.playSound(SoundType.SUCCESS);
        break;
      case 'error':
        this.playSound(SoundType.ERROR);
        break;
      case 'notification':
        this.playSound(SoundType.NOTIFICATION);
        break;
    }
  }
}

// Instância singleton
export const audioManager = new AudioManager();

// Hook React para usar o sistema de áudio
export const useAudio = () => {
  return {
    playSound: audioManager.playSound.bind(audioManager),
    setAmbient: audioManager.setAmbientSound.bind(audioManager),
    playDiceRoll: audioManager.playDiceRoll.bind(audioManager),
    playAttack: audioManager.playAttack.bind(audioManager),
    playUI: audioManager.playUISound.bind(audioManager),
    updateSettings: audioManager.updateSettings.bind(audioManager),
    getSettings: audioManager.getSettings.bind(audioManager),
    isEnabled: audioManager.isEnabled.bind(audioManager)
  };
};

export default audioManager;