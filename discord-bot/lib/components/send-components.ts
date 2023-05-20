import {ActionRowBuilder, EmbedBuilder} from '@discordjs/builders';
import {TextBasedChannel} from 'discord.js';

import {Components} from './types';

type SendComponentsParams = {
    channel: TextBasedChannel;
    components: Components[];
};

export const sendComponents = async ({channel, components}: SendComponentsParams) => {
    const componentsPromises = components.map(async (component) => {
        if (component instanceof EmbedBuilder) {
            await channel.send({embeds: [component]});
        }

        if (component instanceof ActionRowBuilder<any>) {
            await channel.send({components: [component]});
        }
    });

    await Promise.all(componentsPromises);
};
