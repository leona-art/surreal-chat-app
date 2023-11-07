import { ark } from '@ark-ui/solid'
import type { ComponentProps } from 'solid-js'
import { styled } from '~/styled-system/jsx'
import { label, type LabelVariantProps } from '~/styled-system/recipes'

export type LabelProps = LabelVariantProps & ComponentProps<typeof ark.label>
export const Label = styled(ark.label, label)
