import {ActionRowBuilder, EmbedBuilder} from '@discordjs/builders';
import {SendableChannels} from 'discord.js';

import {Components} from './types';

type SendComponentsParams = {
    channel: SendableChannels;
    components: Components[];
};

export const sendComponents = async ({channel, components}: SendComponentsParams) => {
    const componentsPromises = components.map(async (component) => {
        if (component instanceof EmbedBuilder) {
            await channel.send({embeds: [component]});
        }

        if (component instanceof ActionRowBuilder) {
            await channel.send({components: [component]});
        }
    });

    await Promise.all(componentsPromises);
};
