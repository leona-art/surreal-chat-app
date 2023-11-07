import { ark } from '@ark-ui/solid'
import type { ComponentProps } from 'solid-js'
import { styled } from '~/styled-system/jsx'
import { input, type InputVariantProps } from '~/styled-system/recipes'

export type InputProps = InputVariantProps & ComponentProps<typeof ark.input>
export const Input = styled(ark.input, input)
