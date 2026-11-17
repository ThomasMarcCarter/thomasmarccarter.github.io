import championData from '../data/champions.json';
import type { Question } from '../data/questions';

const CDN = `https://ddragon.leagueoflegends.com/cdn/${championData.ddragonVersion}/img`;

export const iconUrl = (pool: Question['pool'], icon: string) => `${CDN}/${pool}/${icon}`;
