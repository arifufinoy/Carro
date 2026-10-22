export type CarroField = 'marca' | 'color' | 'modelo' | 'tipo'

const requiredMessages: Record<CarroField, string> = {
  marca: 'La marca es obligatoria.',
  color: 'El color es obligatorio.',
  modelo: 'El modelo es obligatorio.',
  tipo: 'El tipo es obligatorio.',
}

const invalidMessages: Record<CarroField, string> = {
  marca: 'La marca solo puede contener letras, espacios, guiones y apóstrofes.',
  color: 'El color solo puede contener letras, espacios y guiones.',
  modelo: 'El modelo solo puede contener letras, números, espacios y guiones.',
  tipo: 'El tipo solo puede contener letras, números, espacios y guiones.',
}

const patterns: Record<CarroField, RegExp> = {
  marca: /^\p{L}[\p{L}\p{M}]*(?:[ '’-]\p{L}[\p{L}\p{M}]*)*$/u,
  color: /^\p{L}[\p{L}\p{M}]*(?:[ -]\p{L}[\p{L}\p{M}]*)*$/u,
  modelo: /^[\p{L}\d][\p{L}\p{M}\d]*(?:[ -][\p{L}\d][\p{L}\p{M}\d]*)*$/u,
  tipo: /^(?=.*\p{L})[\p{L}\d][\p{L}\p{M}\d]*(?:[ -][\p{L}\d][\p{L}\p{M}\d]*)*$/u,
}

export function validateCarField(field: CarroField, value: string) {
  if (!value.trim()) {
    return requiredMessages[field]
  }

  return patterns[field].test(value) ? undefined : invalidMessages[field]
}

export function carFieldValidators(field: CarroField) {
  return {
    onMount: ({ value }: { value: string }) => validateCarField(field, value),
    onChange: ({ value }: { value: string }) => validateCarField(field, value),
  }
}
