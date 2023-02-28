import { Box, LinearProgress } from '@mui/material'
import { useCampaignList } from 'common/hooks/campaigns'
import { CampaignResponse } from 'gql/campaigns'
import React from 'react'

function rotateArray<T>(arr: T[], by: number) {
  const newArr = [...arr]
  for (let i = 0; i < by; i++) {
    newArr.push(newArr.shift() as T)
  }
  return newArr
}

export type TimerLineProps = {
  timeout: number
  onDone?: () => void
  pause?: boolean
  barProps?: React.ComponentProps<typeof LinearProgress>
}

function TimerLine({ timeout, onDone, pause, barProps }: TimerLineProps) {
  const [progress, setProgress] = React.useState(0)
  const frameRef = React.useRef<number>()
  const startRef = React.useRef<number>()
  const elapsedRef = React.useRef<number>(0)
  const progressRef = React.useRef<number>(0)

  const step = (timestamp: number) => {
    if (!startRef.current) startRef.current = timestamp
    const elapsed = timestamp - startRef.current - elapsedRef.current
    const progress = (elapsed / timeout) * 100
    progressRef.current = progress > 100 ? 100 : progress
    setProgress(progressRef.current)
    if (progress < 100) {
      frameRef.current = requestAnimationFrame(step)
    } else {
      frameRef.current && cancelAnimationFrame(frameRef.current)
      progressRef.current = 0
      startRef.current = 0
      elapsedRef.current = 0
      onDone?.()
      setProgress(0)
      setTimeout(() => {
        frameRef.current = requestAnimationFrame(step)
      }, 400)
    }
  }

  React.useEffect(() => {
    if (pause) {
      elapsedRef.current = Date.now() - (startRef.current || 0)
      frameRef.current && cancelAnimationFrame(frameRef.current)
      return
    }
    if (!startRef.current || elapsedRef.current === 0) {
      startRef.current = Date.now()
    }
    frameRef.current = requestAnimationFrame(step)
    return () => {
      frameRef.current && cancelAnimationFrame(frameRef.current)
    }
  }, [pause])

  return (
    <LinearProgress
      value={progress}
      aria-hidden="true"
      variant="determinate"
      sx={{
        width: '100%',
        color: theme.palette.primary.main,
        height: 5,
        position: 'relative',
        bottom: 4,
      }}
      {...barProps}
    />
  )
}

const StyledGrid = styled('div')`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
`

function HeroCampaigns() {
  const { data } = useCampaignList()
  const campaigns = data as CampaignResponse[]
  const [currentData, setCurrentData] = React.useState(campaigns)
  React.useEffect(() => {
    setCurrentData(campaigns)
  }, [campaigns])
  return (
    <>
      {currentData ? (
        <Box>
          <StyledGrid>
            <StyledFeaturedCard>
              <CampaignFeaturedCardV2
                key={JSON.stringify(currentData[0])}
                campaign={currentData[0]}
              />
            </StyledFeaturedCard>
            {currentData.slice(1, 5).map((campaign) => (
              <StyledNormalCard key={JSON.stringify(campaign)}>
                <CampaignCardV2 campaign={campaign} />
              </StyledNormalCard>
            ))}
          </StyledGrid>
          <TimerLine
            onDone={() => {
              setCurrentData((prevData) => rotateArray(prevData, 4))
            }}
            timeout={3000}
          />
        </Box>
      ) : (
        <></>
      )}
    </>
  )
}
