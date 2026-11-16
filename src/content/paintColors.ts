/**
 * The 240-color Cromax® swatch library from the Emirates Boats painting portfolio.
 * Hex values are screen approximations; references are Emirates Boats swatch codes.
 */
import { msg } from "../i18n";

export interface PaintColor {
  name: string;
  ref: string;
  hex: string;
}

export interface PaintFamily {
  name: string;
  colors: PaintColor[];
}

const family = (name: string, rows: string): PaintFamily => ({
  name,
  colors: rows.split("|").map((row) => {
    const [colorName, ref, hex] = row.split(";");
    return { name: colorName, ref: `CRM-${ref}`, hex: `#${hex}` };
  }),
});

export const PAINT_FAMILIES: PaintFamily[] = [
  family(msg("Whites & Creams"), "Polar White;PW59;fdfdfd|Arctic White;AW01;f8fafc|Mirror White;MW60;f7f7f5|Alpine Snow;AS61;f5f7fa|Marina White;MW62;f2f4f5|Cloud White;CW14;e5e7eb|Glacier White;GW09;e2e8f0|Sea Salt;SS63;e4e8e6|Chalk White;CW64;ecebe7|Pearl White;PW65;efede8|Sail White;SW66;f4f1ea|Linen White;LW67;eee9df|Bone White;BW68;e8e4da|Oyster Shell;OS69;e3dccf|Seashell;SE70;f6efe6|Coconut Cream;CC71;f2ecdd|Ivory Cream;IC18;f1e9d2|Vanilla Dune;VD72;ede2c8|Champagne Pearl;CP73;e8dcc2|Sand Dollar;SD74;e6d9be"),
  family(msg("Silvers & Light Greys"), "Silver Lining;SL75;dde1e6|Frost Silver;FS76;d8dee5|Sterling Silver;SS15;d1d5db|Pearl Frost;PF08;cbd5e1|Moonlight Silver;MS77;c9ced6|Liquid Silver;LS78;c4c9cf|Brushed Aluminium;BA79;bfc4ca|Chrome Mist;CM80;b9bec6|Silver Birch;SB81;b7b9b4|Platinum Silver;PS82;b4b9c0|Smoke Silver;SS83;b2b5ba|Sea Fog;SF84;b0b8c1|Zinc Silver;ZS85;aeb3b7|Harbour Mist;HM86;a9b2bd|Lunar Grey;LG87;a7a9ac|Satin Pewter;SP88;9da09e|Platinum Mist;PM11;9ca3af|Dolphin Grey;DG89;99a1a8|Titanium Silver;TS03;97a5bc|Nickel Metallic;NM90;8e9399"),
  family(msg("Greys & Gunmetals"), "Granite Grey;GG91;9a9c9b|Concrete Grey;CG92;8d8f8f|Dove Grey;DG93;8a9099|Ash Grey;AG94;858b92|Slate Mist;SM95;7c8794|Pewter Grey;PG96;7a7f85|Smoked Pearl;SP97;6f7478|Alloy Grey;AG12;6b7280|Reef Grey;RG98;6c7b86|Steel Grey;SG02;667389|Marlin Grey;MG99;66707a|Titanium Grey;TG100;5f666e|Ocean Slate;OS101;5e6e7e|Flint Grey;FG102;5b5e62|Anchor Grey;AG103;5a6168|Harbour Grey;HG104;576572|Battleship Grey;BG17;4b6584|Gunmetal Grey;GM46;4a5361|Iron Grey;IG105;4a4e54|Storm Grey;SG07;475569"),
  family(msg("Blacks & Charcoals"), "Shadow Black;SB13;374151|Graphite Charcoal;GC04;334155|Slate Charcoal;SC106;3a3f45|Coal Grey;CG107;33373c|Stealth Grey;SG108;2e3338|Anthracite;AN109;2b2f33|Basalt Black;BB110;292c30|Volcanic Ash;VA111;272a2d|Onyx Black;OB19;222222|Tungsten Dark;TD16;1f2937|Midnight Obsidian;MO06;1e293b|Ebony Wave;EW112;1f2124|Satin Black;SB113;1c1c1c|Black Pearl;BP114;1a1c20|Nightfall Black;NB115;14171b|Carbon Metallic;CM10;111827|Jet Black;JB05;0f172a|Raven Black;RB116;0f1114|Panther Black;PB117;0c0e10|Abyssal Black;AB118;08090b"),
  family(msg("Navy & Deep Blues"), "Navy Metallic;NM33;1e40af|Sapphire Navy;SN119;1d3f9a|Royal Navy;RN21;1e3a8a|Biscay Blue;BB39;1b3b7a|Indigo Tide;IT120;28367f|Midnight Navy;MN36;312e81|Admiral Blue;AB121;1f3a6e|Regatta Navy;RN122;223a6a|Atlantic Navy;AN123;1a3560|Cadet Navy;CN124;213a5c|Yacht Club Blue;YC125;1d3557|Abyss Blue;AB29;172554|Harbour Navy;HN126;1b2f52|Twilight Navy;TN127;1c2a4f|Mariner Navy;MN128;172b4d|Deep Marine;DM129;14284b|Nautical Navy;NN130;11264a|Ink Blue;IB131;0f2040|Deep Sea Navy;DS132;0a1f3d|Submarine Blue;SB133;0d1b35"),
  family(msg("Blues"), "Powder Blue;PB134;b7d4ec|Ice Blue;IB135;a5d8f3|Glacier Blue;GB37;7dd3fc|Cornflower Spray;CS136;6c93d6|Haze Blue;HB34;60a5fa|Denim Wave;DW137;4a78b5|Sky Blue;SB28;38bdf8|Pacific Blue;PB24;3b82f6|Lagoon Blue;LB138;3c9bd6|Cerulean Crest;CC139;2a9fda|Capri Blue;CB140;2e8bc0|Azure Wave;AW31;0a8ad0|Bahama Blue;BB141;1c86c8|Blue Horizon;BH38;0f76b5|Marlin Blue;MB142;1f6fb5|Oceanic Blue;OB23;0369a1|Sapphire Glow;SG30;2563eb|Ultramarine Shine;US143;2f46c8|Cobalt Blue;CB25;1d4ed8|Electric Blue;EB20;1f4bc0"),
  family(msg("Aquas & Teals"), "Aqua Mist;AM144;bdebe8|Sea Glass;SG145;a7dcd5|Crystal Lagoon;CL146;7fd6da|Spearmint Aqua;SA147;62d6c4|Pool Blue;PB148;48c6e0|Bimini Aqua;BA149;3ccfd0|Miami Cyan;MC22;06b6d4|Reef Cyan;RC150;00a6bc|Tropical Turquoise;TT151;12c2b8|Turquoise Reef;TR27;14b8a6|Maldives Teal;MT152;1aafb0|Atlantis Teal;AT153;0f9aa3|Caribbean Aqua;CA32;0891b2|Seafoam Cyan;SC35;0d9488|Arabian Gulf Teal;AG154;0b8c98|Shallows Teal;ST155;12877f|Marina Teal;MT156;107a80|Deep Teal;DT26;0e7490|Peacock Teal;PT157;0a6e78|Dark Lagoon;DL158;0b5e66"),
  family(msg("Greens"), "Sea Foam Mint;SF159;bfe8d2|Fresh Mint;FM160;8fe0b8|Lime Flash;LF161;bdf23c|Key Lime;KL162;b5d334|Lime Spritz;LS163;a8d83f|Apple Green;AG164;7cc444|Mint Splash;MS52;10b981|Spring Green;SG165;3fbf6c|Sage Green;SG166;8a9f7b|Kelly Green;KG167;2e9e4f|Jade Marine;JM56;059669|Tropical Green;TG168;1f8f5f|Olive Drab;OD169;6b7b3a|Military Olive;MO170;55603a|Forest Pine;FP48;047857|Hunter Green;HG171;1e5631|Racing Green;RG172;0b5d3b|Emerald Green;EG44;065f46|Bottle Green;BG173;0f4a3a|Deep Pine;DP174;0a3d2e"),
  family(msg("Yellows & Golds"), "Lemon Sorbet;LS175;f8ee9a|Buttercream;BU176;f5e6a8|Straw Yellow;SY177;e6d58a|Pale Gold;PG178;e3ce8e|Lemon Zest;LZ179;ede04a|Canary Yellow;CY180;ffe135|Miami Yellow;MY181;f9d423|Solar Yellow;SY182;ffd60a|Yellow Flame;YF53;fbbf24|Sunflower;SU183;f7c531|Sunburst Gold;SG49;f2a413|Golden Hour;GH184;ebb13a|Honey Gold;HG185;e6a71c|Saffron;SA186;e69a0e|Royal Gold;RG187;d4af37|Champagne Gold;CG45;d9be7c|Mustard Seed;MS188;cfa32b|Desert Gold;DG189;c2a25e|Brass Gold;BG190;b88a2e|Antique Gold;AG191;a98b3f"),
  family(msg("Oranges & Coppers"), "Apricot Sorbet;AS192;f8c79b|Peach Fizz;PF193;f6b58a|Papaya;PA194;f7a35c|Mango Orange;MO195;f59a3a|Clementine;CL196;f58220|Solar Orange;SO47;f97316|Blaze Orange;BO197;ff6b1a|Hi-Vis Orange;HV198;ff5a00|Sunset Tangerine;ST43;ea580c|Ember Orange;EO199;e8531e|Pumpkin Spice;PS200;e2661f|Amber Glow;AG55;d2691e|Rust Orange;RO201;c75b1f|Paprika;PA202;c8431b|Burnt Orange;BO41;cc5a12|Terracotta;TE203;b5532e|Copper Metallic;CM204;b4672f|Cinnamon Spice;CS205;9b4f2a|Copper Bronze;CB51;9a3412|Burnt Sienna;BS206;8f3b1b"),
  family(msg("Reds & Burgundies"), "Coral Reef;CR207;f4766a|Watermelon Red;WR208;ef4b55|Signal Red;SR209;e8312f|Cherry Racing;CR54;e11d48|Crimson Spark;CS42;dc2626|Fire Engine Red;FE210;d9261c|Racing Red;RR211;d02020|Scarlet Wake;SW212;c81e32|Lipstick Red;LR213;c8102e|Lava Red;LR214;c5281c|Cardinal Gloss;CG58;be123c|Victory Red;VR46;b91c1c|Candy Apple Red;CA215;a4161a|Ruby Red;RR40;a81e22|Brick Red;BR216;9a2f25|Garnet;GA217;8e1b2e|Bordeaux Wine;BW50;7f1d1d|Merlot;ME218;6e1423|Burgundy Reserve;BR219;5c1a24|Oxblood;OX220;4a0e14"),
  family(msg("Bronzes, Earth & Accents"), "Blush Pearl;BP221;ebc5c3|Flamingo Pink;FP222;f48fb1|Magenta Flash;MF223;d81b84|Lavender Mist;LM224;c7b8e6|Orchid Violet;OV225;9b59b6|Amethyst Wave;AW226;7b4fb5|Royal Purple;RP227;5b2e91|Plum Noir;PN228;3f1d4e|Sandstone;SA229;c8b08a|Taupe Sand;TS230;b5a48f|Rose Gold Metallic;RG231;c98b7c|Driftwood;DR232;9c8b77|Teak Brown;TB233;8b6a47|Metallic Bronze;MB57;a67b4a|Burnished Bronze;BB234;8c6a3f|Mocha Brown;MB235;7a5c47|Walnut;WA236;5b4636|Smoked Bronze;SB237;5e4b3a|Chocolate Wake;CW238;5c3a28|Espresso;ES239;4a3328"),
];
