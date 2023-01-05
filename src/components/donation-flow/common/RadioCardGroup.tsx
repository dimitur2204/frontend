import React from 'react'
import {
  Card,
  CardProps,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  RadioGroupProps,
  Stack,
  Unstable_Grid2 as Grid2,
} from '@mui/material'
import { styled, lighten } from '@mui/material/styles'
import theme from 'common/theme'
import { useField } from 'formik'

export const BaseRadioCardItem = styled(Card)(() => ({
  padding: theme.spacing(2),
  margin: 0,
  cursor: 'pointer',
  border: `1px solid ${theme.borders.dark}`,
  width: '100%',
}))

export const DisabledRadioCardItem = styled(BaseRadioCardItem)(() => ({
  opacity: 0.7,
  backgroundColor: `${theme.palette.grey[300]} !important`,
  pointerEvents: 'none',
}))

export const SelectedRadioCardItem = styled(BaseRadioCardItem)(() => ({
  backgroundColor: lighten(theme.palette.primary.light, 0.7),
}))

interface StyledRadioCardItemProps extends CardProps {
  control: React.ReactNode
  icon: React.ReactNode
  disabled?: boolean
  selected?: boolean
}

function RadioCardItem({ control, icon, selected, disabled, ...rest }: StyledRadioCardItemProps) {
  let StyledRadioCardItem = BaseRadioCardItem
  if (disabled) {
    StyledRadioCardItem = DisabledRadioCardItem
  } else if (selected) {
    StyledRadioCardItem = SelectedRadioCardItem
  }
  return (
    <StyledRadioCardItem
      sx={{ backgroundColor: selected ? lighten(theme.palette.primary.light, 0.7) : 'inherit' }}
      {...rest}>
      <Stack justifyContent="center" alignItems="center">
        {icon}
        {control}
      </Stack>
    </StyledRadioCardItem>
  )
}

type Option = {
  value: string
  label: string
  icon: React.ReactNode
  disabled?: boolean
}

export interface RadioCardGroupProps extends RadioGroupProps {
  options: Option[]
  name: string
  columns: 1 | 2 | 3 | 4 | 6 | 12
}

function RadioCardGroup({ options, name, columns }: RadioCardGroupProps) {
  const [field, meta, { setValue }] = useField(name)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }
  return (
    <FormControl
      fullWidth
      required
      component="fieldset"
      error={Boolean(meta.error) && Boolean(meta.touched)}>
      <RadioGroup value={field.value} onChange={handleChange}>
        <Grid2 spacing={2} container>
          {options.map((option) => (
            <Grid2 xs={12} sm={12 / columns} key={option.value}>
              <RadioCardItem
                onClick={() => setValue(option.value)}
                control={
                  <FormControlLabel
                    value={option.value}
                    disableTypography
                    disabled={option.disabled}
                    sx={{ margin: 0, ...theme.typography.h6 }}
                    control={
                      <Radio
                        disabled={option.disabled}
                        sx={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
                      />
                    }
                    label={option.label}
                  />
                }
                icon={option.icon}
                selected={field.value === option.value && !option.disabled}
                disabled={option.disabled}
              />
            </Grid2>
          ))}
        </Grid2>
      </RadioGroup>
    </FormControl>
  )
}

export default RadioCardGroup
