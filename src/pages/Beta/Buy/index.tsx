import { Box, useWalletModalToggle } from '@pangolindex/components'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { initOnRamp } from '@coinbase/cbpay-js'
import { MOONPAY_PK, BUY_MENU_LINK, COINBASE_PK } from 'src/constants'
import { useActiveWeb3React } from 'src/hooks'
import styled from 'styled-components'
import { ToggleWalletButton, WalletIcon } from './styled'
export interface BuyProps {
  type: string
}

interface CBPayInstanceType {
  open: () => void
  destroy: () => void
}

const Iframe = styled.iframe`
  border: 0;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`

export default function BuyV2() {
  const params = useParams<BuyProps>()
  const [init, setInit] = useState(false)
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  useEffect(() => {
    console.log('useEffect', init, params, account)
    if (init) return
    if (params?.type !== BUY_MENU_LINK.coinbasePay) return
    if (!account) return
    setInit(true)
    console.log('starting initOnRamp')
    initOnRamp(
      {
        appId: COINBASE_PK,
        widgetParameters: {
          destinationWallets: [
            {
              address: account,
              blockchains: ['avalanche-c-chain']
            }
          ]
        },
        experienceLoggedIn: 'embedded',
        experienceLoggedOut: 'popup'
      },
      (err, instance) => {
        if (err) {
          console.error(err)
        } else if (instance) {
          console.log('opening instance', instance)
          instance.open()
        }
      }
    )
  }, [account])

  // coinbase pay needs an account, so if user is not connected then ask to connect wallet
  if (!account && params?.type === BUY_MENU_LINK.coinbasePay) {
    return (
      <>
        <Box
          display="flex"
          alignItems="center"
          maxWidth={250}
          margin="0px auto"
          justifyContent="center"
          width="100%"
          height="100%"
          flex={1}
        >
          <ToggleWalletButton variant="primary" onClick={toggleWalletModal} width="100%">
            <WalletIcon color="black" />
            Connect Wallet
          </ToggleWalletButton>
        </Box>
      </>
    )
  }

  const url =
    params?.type === BUY_MENU_LINK.moonpay
      ? `https://buy.moonpay.io?apiKey=${MOONPAY_PK}`
      : `https://pay.coinbase.com/buy/select-asset?appId=${COINBASE_PK}&destinationWallets=%5B%7B%22address%22%3A%22${account}%22%2C%22blockchains%22%3A%5B%22avalanche-c-chain%22%5D%7D%5D`
  if (params?.type === BUY_MENU_LINK.moonpay) {
    return (
      <Iframe
        title="Buy"
        allow="accelerometer; autoplay; camera; gyroscope; payment"
        width="100%"
        height="100%"
        src={url}
      >
        <p>Your browser does not support iframes.</p>
      </Iframe>
    )
  } else if (params?.type === BUY_MENU_LINK.coinbasePay) {
    return <div />
  }
}
