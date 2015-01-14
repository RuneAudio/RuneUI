#!/bin/bash
#
# wolson.sh
# ----------------
# Select the audio output for the Wolfson Audio Card in RuneAudio
#
# Set some standard paths
AMIXER=/usr/bin/amixer
MPC=/usr/bin/mpc
#
# Set variables
CARD="$1"
ENABLE_OUTPUT="$2"
#
function amixer_cset {
   $AMIXER -c $CARD cset name="$1" $2
}
#
# function wolfson_enable {
#   $MPC enable only snd_rpi_wsp
#
#
function reset_paths {
  #
  # Switch everything off
  #
  amixer_cset 'TX Playback Switch'          off
  amixer_cset 'RX Playback Switch'          off
  amixer_cset 'AIF Playback Switch'         off
  amixer_cset 'SPDIF in Switch'             off
  amixer_cset 'SPDIF out Switch'            off
  #amixer_cset 'IN1 Digital Switch'          off
  #amixer_cset 'IN2 Digital Switch'          off
  #amixer_cset 'IN3 Digital Switch'          off
  amixer_cset 'IN3 High Performance Switch' off
  amixer_cset 'Headset Mic Switch'          off
  amixer_cset 'DMIC Switch'                 off
  amixer_cset 'Speaker Digital Switch'      off
  amixer_cset 'AIF1TX1 Input 1'             None
  amixer_cset 'AIF1TX2 Input 1'             None
  amixer_cset 'AIF2TX1 Input 1'             None
  amixer_cset 'AIF2TX2 Input 1'             None
  amixer_cset 'HPOUT1L Input 1'             None
  amixer_cset 'HPOUT1R Input 1'             None
  amixer_cset 'HPOUT1L Input 2'             None
  amixer_cset 'HPOUT1R Input 2'             None
  amixer_cset 'HPOUT2L Input 1'             None
  amixer_cset 'HPOUT2R Input 1'             None
  amixer_cset 'HPOUT2L Input 2'             None
  amixer_cset 'HPOUT2R Input 2'             None
  amixer_cset 'SPKOUTL Input 1'             None
  amixer_cset 'SPKOUTR Input 1'             None
  amixer_cset 'SPKOUTL Input 2'             None
  amixer_cset 'SPKOUTR Input 2'             None
}
#
function line_out {
  #
  # Enable MPD output only to line_out
  #  $MPC enable only snd_rpi_wsp_1
  #
  # Playback from AP to Lineout
  #
  amixer_cset 'HPOUT2 Digital Switch'  on
  amixer_cset 'HPOUT2L Input 1'        AIF1RX1
  amixer_cset 'HPOUT2L Input 1 Volume' 32
  amixer_cset 'HPOUT2R Input 1'        AIF1RX2
  amixer_cset 'HPOUT2R Input 1 Volume' 32
}
#
function speakers_out {
  #
  # Enable MPD output only to speakers
  # $MPC enable only snd_rpi_wsp_4
  #
  # Playback from AP to Speakers
  #
  amixer_cset 'Speaker Digital Volume' 128
  # reset speaker mixer inputs
  amixer_cset 'SPKOUTL Input 1'        None
  amixer_cset 'SPKOUTR Input 1'        None
  amixer_cset 'SPKOUTL Input 2'        None
  amixer_cset 'SPKOUTR Input 2'        None
  # Route AP to Speaker mixer
  amixer_cset 'SPKOUTL Input 1'        AIF1RX1
  amixer_cset 'SPKOUTL Input 1 Volume' 32
  amixer_cset 'SPKOUTR Input 1'        AIF1RX2
  amixer_cset 'SPKOUTR Input 1 Volume' 32
  # Unmute speaker output
  amixer_cset 'Speaker Digital Switch' on
}
#
function spdif_out {
  #
  # Enable MPD output only to SPDIF
  # $MPC enable only snd_rpi_wsp_2
  #
  # Playback from AP to SPDIF
  #
  amixer_cset 'SPDIF out Switch'       on
  amixer_cset 'TX Playback Switch'     on
  amixer_cset 'Input Source'           AIF
  amixer_cset 'AIF Playback Switch'    on
  amixer_cset 'AIF2TX1 Input 1'        AIF1RX1
  amixer_cset 'AIF2TX1 Input 1 Volume' 32
  amixer_cset 'AIF2TX2 Input 1'        AIF1RX2
  amixer_cset 'AIF2TX2 Input 1 Volume' 32
}
function headset_out {
  #
  # Enable MPD output to headset only
  # $MPC enable only snd_rpi_wsp_3
  #
  # Playback from AP to Headset
  #
  #
  amixer_cset 'HPOUT1 Digital Switch'  on
  # Set path gain to -6dB for safety. ie max 0.5Vrms output level
  amixer_cset 'HPOUT1 Digital Volume'  116
  # Do we want to clear the HPOUT mixer inputs?
  amixer_cset 'HPOUT1L Input 1'        None
  amixer_cset 'HPOUT1R Input 1'        None
  amixer_cset 'HPOUT1L Input 2'        None
  amixer_cset 'HPOUT1R Input 2'        None
  amixer_cset 'HPOUT1L Input 1'        AIF1RX1
  amixer_cset 'HPOUT1L Input 1 Volume' 32
  amixer_cset 'HPOUT1R Input 1'        AIF1RX2
  amixer_cset 'HPOUT1R Input 1 Volume' 32
}
#
#
# MAIN
#
# wolfson_enable
reset_paths
$ENABLE_OUTPUT
