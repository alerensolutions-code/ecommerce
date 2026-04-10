import { Product } from '../types';

export type CompatibilityResult = {
  isValid: boolean;
  message?: string;
  type: 'error' | 'warning' | 'info';
};

export class CompatibilityEngine {
  /**
   * Valida la compatibilidad entre el Procesador y la Placa Madre.
   * Regla: El campo 'Socket' debe coincidir.
   */
  static checkCpuMother(cpu?: Product, mother?: Product): CompatibilityResult {
    if (!cpu || !mother) return { isValid: true, type: 'info' };

    const cpuSocket = cpu.technical_specs?.['Socket'];
    const motherSocket = mother.technical_specs?.['Socket'];

    if (!cpuSocket || !motherSocket) {
      return { 
        isValid: true, 
        message: 'No se pudo verificar el Socket, pero podrías continuar bajo tu propio riesgo.', 
        type: 'warning' 
      };
    }

    if (cpuSocket.toLowerCase().trim() !== motherSocket.toLowerCase().trim()) {
      return { 
        isValid: false, 
        message: `Incompatible: El procesador usa socket ${cpuSocket} y la placa madre usa ${motherSocket}.`, 
        type: 'error' 
      };
    }

    return { isValid: true, type: 'info' };
  }

  /**
   * Valida la compatibilidad entre la Placa Madre y la Memoria RAM.
   * Regla: El tipo de memoria (DDR4/DDR5) debe coincidir.
   */
  static checkMotherRam(mother?: Product, ram?: Product): CompatibilityResult {
    if (!mother || !ram) return { isValid: true, type: 'info' };

    const motherRamType = mother.technical_specs?.['Tipo de Memoria'];
    const ramType = ram.technical_specs?.['Tipo de Memoria'] || ram.technical_specs?.['Tipo'];

    if (!motherRamType || !ramType) return { isValid: true, type: 'info' };

    if (!motherRamType.toLowerCase().includes(ramType.toLowerCase().trim())) {
      return { 
        isValid: false, 
        message: `Incompatible: La placa soporta ${motherRamType} y la RAM es ${ramType}.`, 
        type: 'error' 
      };
    }

    return { isValid: true, type: 'info' };
  }

  /**
   * Valida si la Fuente de Poder es suficiente para los componentes.
   * Regla: Potencia PSU >= Fuente Recomendada de la GPU.
   */
  static checkPsu(psu?: Product, gpu?: Product): CompatibilityResult {
    if (!psu || !gpu) return { isValid: true, type: 'info' };

    const psuWattsStr = psu.technical_specs?.['Potencia (Watts)'];
    const gpuRecommendedStr = gpu.technical_specs?.['Fuente Recomendada'];

    if (!psuWattsStr || !gpuRecommendedStr) return { isValid: true, type: 'info' };

    const psuWatts = parseInt(psuWattsStr);
    const gpuRec = parseInt(gpuRecommendedStr);

    if (isNaN(psuWatts) || isNaN(gpuRec)) return { isValid: true, type: 'info' };

    if (psuWatts < gpuRec) {
      return { 
        isValid: false, 
        message: `Advertencia de Energía: Se recomienda una fuente de al menos ${gpuRec}W para esta placa de video. La fuente elegida es de ${psuWatts}W.`, 
        type: 'warning' 
      };
    }

    return { isValid: true, type: 'info' };
  }

  /**
   * Valida si la GPU entra en el Gabinete.
   * Regla: Largo GPU <= Largo Máximo Gabinete.
   */
  static checkCaseGpu(gabinete?: Product, gpu?: Product): CompatibilityResult {
    if (!gabinete || !gpu) return { isValid: true, type: 'info' };

    const caseMaxStr = gabinete.technical_specs?.['Largo Máximo GPU'];
    const gpuLengthStr = gpu.technical_specs?.['Largo (mm)'];

    if (!caseMaxStr || !gpuLengthStr) return { isValid: true, type: 'info' };

    const caseMax = parseInt(caseMaxStr);
    const gpuLength = parseInt(gpuLengthStr);

    if (isNaN(caseMax) || isNaN(gpuLength)) return { isValid: true, type: 'info' };

    if (gpuLength > caseMax) {
      return { 
        isValid: false, 
        message: `Físicamente Incompatible: La placa de video mide ${gpuLength}mm y el gabinete solo soporta hasta ${caseMax}mm.`, 
        type: 'error' 
      };
    }

    return { isValid: true, type: 'info' };
  }

  /**
   * Ejecuta todas las validaciones cruzadas.
   */
  static validateBuild(build: {
    cpu?: Product;
    mother?: Product;
    ram?: Product;
    gpu?: Product;
    psu?: Product;
    case?: Product;
  }): CompatibilityResult[] {
    const results: CompatibilityResult[] = [];

    const cpuMother = this.checkCpuMother(build.cpu, build.mother);
    if (!cpuMother.isValid || cpuMother.message) results.push(cpuMother);

    const motherRam = this.checkMotherRam(build.mother, build.ram);
    if (!motherRam.isValid || motherRam.message) results.push(motherRam);

    const psuCheck = this.checkPsu(build.psu, build.gpu);
    if (!psuCheck.isValid || psuCheck.message) results.push(psuCheck);

    const caseGpu = this.checkCaseGpu(build.case, build.gpu);
    if (!caseGpu.isValid || caseGpu.message) results.push(caseGpu);

    return results;
  }
}
