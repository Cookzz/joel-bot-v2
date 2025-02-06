export const getVoiceChannel = (interaction: any) => {
    return interaction.member.voice?.channel?.id ?? null
}