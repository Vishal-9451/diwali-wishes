/**
 * Curated Diwali wish templates.
 * Works fully offline - no generative AI is used anywhere in this project.
 *
 * Each template is: [toneTags, english, hindi, hinglish]
 * Tone tags: r = romantic, e = emotional, f = funny, y = royal, t = traditional, p = professional
 *
 * Romantic tags only ever appear in the crush / girlfriend / boyfriend categories,
 * so romantic wishes can never be generated for family, parents, teachers or colleagues.
 */

export const LANGUAGES = [
  { id: 'en', label: 'English', lang: 'en' },
  { id: 'hi', label: 'हिन्दी', lang: 'hi' },
  { id: 'hing', label: 'Hinglish', lang: 'en-IN' },
];

export const TONES = [
  { id: 'emotional', label: 'Emotional', tag: 'e' },
  { id: 'funny', label: 'Funny', tag: 'f' },
  { id: 'romantic', label: 'Romantic', tag: 'r' },
  { id: 'royal', label: 'Royal', tag: 'y' },
  { id: 'traditional', label: 'Traditional', tag: 't' },
  { id: 'professional', label: 'Professional', tag: 'p' },
];

const TAG_TO_TONE = Object.fromEntries(TONES.map((t) => [t.tag, t.id]));

/** Greeting prefix + sign-off style + friendly fallbacks for missing names. */
export const CATEGORIES = [
  { id: 'crush', label: 'Crush', prefix: 'warm', signoff: 'crush',
    fallback: { en: 'Someone Special', hi: 'ख़ास इंसान', hing: 'Someone Special' } },
  { id: 'girlfriend', label: 'Girlfriend', prefix: 'warm', signoff: 'romantic',
    fallback: { en: 'My Love', hi: 'मेरी जान', hing: 'Meri Jaan' } },
  { id: 'boyfriend', label: 'Boyfriend', prefix: 'warm', signoff: 'romantic',
    fallback: { en: 'My Love', hi: 'मेरी जान', hing: 'Meri Jaan' } },
  { id: 'bestfriend', label: 'Best Friend', prefix: 'warm', signoff: 'love',
    fallback: { en: 'Best Friend', hi: 'दोस्त', hing: 'Dost' } },
  { id: 'friends', label: 'Friends', prefix: 'warm', signoff: 'love',
    fallback: { en: 'Friends', hi: 'दोस्तों', hing: 'Doston' } },
  { id: 'family', label: 'Family', prefix: 'respect', signoff: 'respect',
    fallback: { en: 'Family', hi: 'परिवारजन', hing: 'Parivar' } },
  { id: 'brother', label: 'Brother', prefix: 'warm', signoff: 'love',
    fallback: { en: 'Bhai', hi: 'भाई', hing: 'Bhai' } },
  { id: 'sister', label: 'Sister', prefix: 'warm', signoff: 'love',
    fallback: { en: 'Behna', hi: 'बहना', hing: 'Behna' } },
  { id: 'parents', label: 'Parents', prefix: 'respect', signoff: 'respect',
    fallback: { en: 'Mom & Dad', hi: 'मम्मी-पापा', hing: 'Mummy-Papa' } },
  { id: 'grandparents', label: 'Grandparents', prefix: 'respect', signoff: 'respect',
    fallback: { en: 'Grandparents', hi: 'दादा-दादी', hing: 'Dada-Dadi' } },
  { id: 'teacher', label: 'Teacher', prefix: 'respect', signoff: 'formal',
    fallback: { en: 'Teacher', hi: 'गुरुजी', hing: 'Guruji' } },
  { id: 'colleagues', label: 'Colleagues', prefix: 'neutral', signoff: 'formal',
    fallback: { en: 'Colleagues', hi: 'साथियों', hing: 'Saathiyon' } },
  { id: 'everyone', label: 'Everyone', prefix: 'neutral', signoff: 'everyone',
    fallback: { en: 'Friends', hi: 'सभी', hing: 'Sabhi' } },
];

const PREFIX = {
  warm: { en: 'Dear', hi: 'प्रिय', hing: 'Dear' },
  respect: { en: 'Respected', hi: 'आदरणीय', hing: 'Aadarneey' },
  neutral: { en: 'Dear', hi: 'प्रिय', hing: 'Dear' },
};

const SIGNOFF = {
  crush: { en: 'Warmly,', hi: 'सस्नेह,', hing: 'Dil se,' },
  romantic: { en: 'With all my love,', hi: 'ढेर सारे प्यार के साथ,', hing: 'Dher saare pyaar ke saath,' },
  love: { en: 'With love,', hi: 'प्रेम सहित,', hing: 'Pyaar ke saath,' },
  respect: { en: 'With love and respect,', hi: 'सादर,', hing: 'Sadar pranaam,' },
  formal: { en: 'With warm regards,', hi: 'सादर,', hing: 'Sadar,' },
  everyone: { en: 'Warm wishes,', hi: 'शुभकामनाओं सहित,', hing: 'Shubhkamnaon ke saath,' },
};

export const SENDER_FALLBACK = {
  en: 'Your well-wisher',
  hi: 'आपका शुभचिंतक',
  hing: 'Aapka well-wisher',
};

const RAW = {
  crush: [
    ['re', 'May the glow of every diya remind you how brightly you light up my days. Hoping this Diwali brings you sweet surprises, and maybe a few more conversations with me.',
      'दीयों की हर लौ याद दिलाती है कि आप मेरे दिनों को कितना रोशन करते हैं। इस दीपावली आपको मीठी खुशियाँ मिलें, और शायद हमारी बातें भी थोड़ी और हों।',
      'Har diye ki lau yaad dilati hai ki aap meri zindagi ko kitna roshan karte ho. Is Diwali aapko meethi khushiyan mile, aur shayad humari baatein bhi thodi zyada hon.'],
    ['rf', 'Diwali has sweets, lights and fireworks, but honestly my favourite part of the festival would be getting a smile from you. Happy Diwali!',
      'दिवाली में मिठाई, रोशनी और पटाखे सब हैं, पर सच कहूँ तो त्योहार की सबसे अच्छी बात आपकी एक मुस्कान होगी। शुभ दीपावली!',
      'Diwali mein mithai, lights aur patakhe sab hain, par sach bolu toh festival ki best cheez aapki ek smile hogi. Happy Diwali!'],
    ['er', 'Some people feel like a diya in a dark room: quiet, warm and impossible to ignore. Wishing you a Diwali as beautiful as the light you bring around you.',
      'कुछ लोग अँधेरे कमरे के दीये जैसे होते हैं: शांत, गर्म और अनदेखा न किए जा सकने वाले। आपकी दीपावली उतनी ही सुंदर हो जितनी रोशनी आप अपने आसपास फैलाते हैं।',
      'Kuch log andhere kamre ke diye jaise hote hain: shaant, warm aur ignore na kiye ja sakne wale. Aapki Diwali utni hi khoobsurat ho jitni roshni aap apne aaspaas failate ho.'],
    ['f', 'If happiness were fireworks, your smile would be the grand finale. May your Diwali be full of sweets, laughter and absolutely no awkward silences when you talk to me!',
      'अगर खुशी पटाखे होती, तो आपकी मुस्कान उसका सबसे शानदार फिनाले होती। आपकी दीपावली मिठाई और हँसी से भरी हो, और मुझसे बात करते समय कोई अजीब चुप्पी न हो!',
      'Agar khushi patakhe hoti, toh aapki smile uska grand finale hoti. Aapki Diwali mithai aur hansi se bhari ho, aur mujhse baat karte waqt koi awkward silence na ho!'],
    ['erf', 'A small Diwali wish from someone who smiles a little every time you walk by. May your year be bright, your heart light and your sweets unlimited.',
      'एक छोटी-सी दीपावली शुभकामना, उसकी ओर से जिसके चेहरे पर आपको देखकर हर बार मुस्कान आ जाती है। आपका साल रोशन, मन हल्का और मिठाइयाँ बेहिसाब रहें।',
      'Ek chhoti si Diwali wish, uski taraf se jiske chehre par aapko dekhkar har baar smile aa jaati hai. Aapka saal roshan, mann halka aur mithaiyan behisaab rahein.'],
  ],
  girlfriend: [
    ['rey', 'Every diya I light this Diwali carries one wish: to be by your side in every festival to come. You are my brightest light. Happy Diwali, my love.',
      'इस दीपावली मैं जो भी दीया जलाऊँ, उसमें एक ही दुआ है कि आने वाले हर त्योहार में तुम्हारा साथ मिले। तुम मेरी सबसे रोशन रोशनी हो। शुभ दीपावली, मेरी जान।',
      'Is Diwali jo bhi diya jalaun, usme bas ek dua hai ki aane wale har festival mein tumhara saath mile. Tum meri sabse roshan light ho. Happy Diwali, meri jaan.'],
    ['ry', 'Like a thousand golden lamps lighting a palace, you light up my entire world. May this Diwali crown you with joy and make every dream of yours come true.',
      'जैसे हज़ारों सुनहरे दीप किसी महल को रोशन कर दें, वैसे ही तुम मेरी पूरी दुनिया रोशन कर देती हो। यह दीपावली तुम्हें खुशियों का ताज पहनाए और तुम्हारा हर सपना पूरा करे।',
      'Jaise hazaaron sunehre deep kisi mahal ko roshan kar dein, waise hi tum meri poori duniya roshan kar deti ho. Yeh Diwali tumhe khushiyon ka taaj pehnaye aur tumhara har sapna poora kare.'],
    ['er', 'Through every season, you have been my home. This Diwali I am grateful for your smile, your patience and the light you add to my life. I want your company forever.',
      'हर मौसम में तुम मेरा घर रही हो। इस दीपावली मैं तुम्हारी मुस्कान, तुम्हारे धैर्य और मेरी ज़िंदगी में लाई रोशनी के लिए आभारी हूँ। हमेशा के लिए तुम्हारा साथ चाहिए।',
      'Har mausam mein tum mera ghar rahi ho. Is Diwali main tumhari smile, tumhare sabr aur meri zindagi mein laayi roshni ke liye aabhaari hoon. Hamesha ke liye tumhara saath chahiye.'],
    ['fr', 'You are the sparkler to my firecracker, the sweetness to my mithai and the reason my Diwali budget disappears. Happy Diwali, love of my life!',
      'तुम मेरे पटाखे की फुलझड़ी हो, मेरी मिठाई की मिठास हो और मेरे दिवाली बजट के गायब होने की वजह भी। शुभ दीपावली, मेरी जान!',
      'Tum mere patakhe ki phuljhadi ho, meri mithai ki mithaas ho aur mere Diwali budget ke gayab hone ki wajah bhi. Happy Diwali, meri jaan!'],
    ['fe', 'Promise me this Diwali: you eat the sweets, we light the fireworks together, and we both pretend the cleaning was fun. Love you more than all the lights combined!',
      'इस दीपावली वादा करो: मिठाई तुम खाना, पटाखे हम मिलकर जलाएँगे, और सफ़ाई को दोनों मज़ेदार बताएँगे। सारी रोशनियों से भी ज़्यादा प्यार तुमसे!',
      'Is Diwali promise karo: mithai tum khana, patakhe hum milkar jalayenge, aur safai ko dono mazedaar batayenge. Saari roshniyon se bhi zyada pyaar tumse!'],
  ],
  boyfriend: [
    ['rey', 'With you beside me, every diya burns a little brighter. I pray that your year is full of success, peace and endless happiness. You are my favourite person.',
      'तुम्हारे साथ होने से हर दीया थोड़ा और रोशन लगता है। दुआ है कि तुम्हारा साल सफलता, सुकून और अनगिनत खुशियों से भरा रहे। तुम मेरे सबसे ख़ास इंसान हो।',
      'Tumhare saath hone se har diya thoda aur roshan lagta hai. Dua hai ki tumhara saal safalta, sukoon aur anginat khushiyon se bhara rahe. Tum mere sabse khaas insaan ho.'],
    ['ry', 'A king deserves a golden Diwali. May prosperity walk beside you, success follow you and my love light up every step you take.',
      'तुम्हारे जैसे राजा के लिए सुनहरी दीपावली ही बनती है। समृद्धि तुम्हारे साथ चले, सफलता पीछे-पीछे आए और मेरा प्यार तुम्हारे हर कदम को रोशन करे।',
      'Tumhare jaise raja ke liye sunehri Diwali hi banti hai. Samriddhi tumhare saath chale, safalta peeche-peeche aaye aur mera pyaar tumhare har kadam ko roshan kare.'],
    ['er', 'Thank you for being my calm in every storm and my light on every dark day. This Diwali, I wish you the same peace you give me. Always with you.',
      'हर तूफ़ान में मेरा सुकून और हर अँधेरे दिन में मेरी रोशनी बनने के लिए शुक्रिया। इस दीपावली तुम्हें वही शांति मिले जो तुम मुझे देते हो। हमेशा तुम्हारे साथ।',
      'Har toofan mein mera sukoon aur har andhere din mein meri roshni banne ke liye shukriya. Is Diwali tumhe wahi shanti mile jo tum mujhe dete ho. Hamesha tumhare saath.'],
    ['fr', 'You are the reason my Diwali has extra sparkle and my sweets box empties faster. Happy Diwali, you lovely troublemaker!',
      'तुम्हारी वजह से मेरी दिवाली में एक्स्ट्रा चमक रहती है और मिठाई का डिब्बा जल्दी खाली होता है। शुभ दीपावली, मेरे प्यारे शरारती!',
      'Tumhari wajah se meri Diwali mein extra chamak rehti hai aur mithai ka dabba jaldi khali hota hai. Happy Diwali, mere pyaare shararti!'],
    ['fe', 'Wishing us a Diwali with loud laughter, quiet moments and absolutely no burnt fingers. We light the diyas together, you keep lighting up my life. Deal?',
      'हमारी दीपावली में ज़ोरदार हँसी हो, सुकून भरे पल हों और किसी की उँगली न जले। दीये हम जलाएँगे, और मेरी ज़िंदगी तुम रोशन करते रहना। पक्का?',
      'Humari Diwali mein zordaar hansi ho, sukoon bhare pal hon aur kisi ki ungli na jale. Diye hum jalayenge, aur meri zindagi tum roshan karte rehna. Pakka?'],
  ],
  bestfriend: [
    ['f', 'Happy Diwali to the friend who eats half my sweets and still calls it sharing. May your life sparkle brighter than our worst jokes. Our friendship is permanent, no returns allowed!',
      'शुभ दीपावली उस दोस्त को, जिसे मेरी आधी मिठाई खाकर भी उसे शेयरिंग कहने में शर्म नहीं आती! तुम्हारी ज़िंदगी हमारे बेकार जोक्स से भी ज़्यादा चमके। यह दोस्ती अब पक्की है, छूटने वाली नहीं!',
      'Shubh Diwali us dost ko jise meri aadhi mithai khakar bhi usse sharing kehne mein sharam nahi aati! Tumhari life hamare bekar jokes se bhi zyada chamke. Yeh dosti ab pakki hai, chhootne wali nahi!'],
    ['e', 'Through every exam, heartbreak and midnight chat, you have been my constant light. This Diwali I am thankful for you more than for any festival. Never change.',
      'हर इम्तिहान, हर टूटे दिल और आधी रात की हर बातचीत में तुम मेरी सबसे भरोसेमंद रोशनी हो। इस दीपावली मैं किसी भी त्योहार से ज़्यादा तुम्हारे होने का शुक्रगुज़ार हूँ। जैसे हो, वैसे ही रहना।',
      'Har exam, har toota dil aur raat ki har baat mein tum meri sabse bharosemand roshni ho. Is Diwali main kisi bhi festival se zyada tumhare hone ka shukraguzaar hoon. Jaise ho, waise hi rehna.'],
    ['fe', 'May your Diwali be filled with sweets, your phone with blessings and your pocket with just enough money to treat me. Happy Diwali, bestie!',
      'तुम्हारी दीपावली मिठाइयों से, फ़ोन शुभकामनाओं से और जेब इतनी भरी रहे कि मुझे ट्रीट मिल सके। शुभ दीपावली, मेरे बेस्टी!',
      'Tumhari Diwali mithaiyon se, phone shubhkamnaon se aur jeb itni bhari rahe ki mujhe treat mil sake. Happy Diwali, bestie!'],
    ['te', 'Wishing my dearest friend a Diwali full of blessings from Goddess Lakshmi, good health, good luck and a lifetime of memories with me by your side.',
      'मेरे सबसे प्यारे दोस्त को माँ लक्ष्मी का आशीर्वाद, अच्छी सेहत, अच्छी किस्मत और मेरे साथ यादों से भरी पूरी ज़िंदगी मिले। शुभ दीपावली!',
      'Mere sabse pyaare dost ko Maa Lakshmi ka ashirwad, achhi sehat, achhi kismat aur mere saath yaadon se bhari poori zindagi mile. Shubh Deepawali!'],
    ['tf', "Let's light diyas, burst crackers, eat way too many sweets and make another year of memories. Happy Diwali, partner in every crime!",
      'चलो दीये जलाएँ, पटाखे फोड़ें, ज़रूरत से ज़्यादा मिठाइयाँ खाएँ और एक और साल की यादें बनाएँ। शुभ दीपावली, मेरी हर शरारत के साथी!',
      'Chalo diye jalayein, patakhe phodein, zaroorat se zyada mithaiyan khayein aur ek aur saal ki yaadein banayein. Shubh Diwali, meri har shararat ke saathi!'],
  ],
  friends: [
    ['ft', 'Diwali is here and so is the season of eating mithai with zero guilt. Wishing my amazing friends a festival full of laughter, lights and free refills of sweets!',
      'दीपावली आ गई है और बिना किसी अपराधबोध के मिठाई खाने का मौसम भी। मेरे सभी दोस्तों को हँसी, रोशनी और मिठाइयों के अंतहीन रिफिल वाली दीपावली मुबारक!',
      'Diwali aa gayi hai aur bina guilt ke mithai khane ka season bhi. Mere saare doston ko hansi, roshni aur mithaiyon ke unlimited refill wali Diwali mubarak!'],
    ['et', 'Friends like you turn ordinary days into celebrations. This Diwali, I am grateful for every laugh we have shared. May our friendship keep glowing year after year.',
      'तुम जैसे दोस्त आम दिनों को भी जश्न बना देते हैं। इस दीपावली हमारी हर साझा हँसी के लिए दिल से शुक्रिया। हमारी दोस्ती हर साल यूँ ही जगमगाती रहे।',
      'Tum jaise dost aam dinon ko bhi jashn bana dete hain. Is Diwali humari har shared hansi ke liye dil se shukriya. Humari dosti har saal yunhi jagmagati rahe.'],
    ['f', 'May your Diwali be brighter than your phone screen at 2 a.m. and sweeter than the gossip we love so much. Happy Diwali, my favourite people!',
      'तुम्हारी दीपावली रात दो बजे की फ़ोन स्क्रीन से भी ज़्यादा रोशन और हमारी पसंदीदा गपशप से भी ज़्यादा मीठी हो। शुभ दीपावली, मेरे पसंदीदा लोगो!',
      'Tumhari Diwali raat ke 2 baje ki phone screen se bhi zyada roshan aur humari favourite gossip se bhi zyada meethi ho. Happy Diwali, mere favourite log!'],
    ['te', 'May the lamps of Diwali drive away every worry and fill your home with prosperity, good health and togetherness. Happy Diwali to you and your loved ones!',
      'दीपावली के दीप आपकी हर चिंता दूर करें और आपके घर को समृद्धि, अच्छी सेहत और अपनों के साथ से भर दें। आपको और आपके परिवार को शुभ दीपावली!',
      'Diwali ke deep aapki har chinta door karein aur aapke ghar ko samriddhi, achhi sehat aur apnon ke saath se bhar dein. Aapko aur aapke parivar ko Shubh Deepawali!'],
    ['fe', 'Another Diwali, another year of surviving cleaning, shopping and relatives together. Here is to us, the lights and the good times ahead!',
      'एक और दीपावली, एक और साल जब हमने मिलकर सफ़ाई, शॉपिंग और रिश्तेदारों को झेल लिया। हमारे नाम, इन रोशनियों के नाम और आने वाले अच्छे वक़्त के नाम!',
      'Ek aur Diwali, ek aur saal jab humne milkar safai, shopping aur rishtedaron ko jhel liya. Hum sabke naam, in lights ke naam aur aane wale achhe waqt ke naam!'],
  ],
  family: [
    ['et', 'May this Diwali bring our family closer, fill our home with laughter and light every corner with love. I am grateful to have each one of you in my life.',
      'यह दीपावली हमारे परिवार को और करीब लाए, हमारे घर को हँसी से भर दे और हर कोने को प्यार से रोशन करे। आप सबका मेरे जीवन में होना मेरा सौभाग्य है।',
      'Yeh Diwali humare parivar ko aur kareeb laye, humare ghar ko hansi se bhar de aur har kone ko pyaar se roshan kare. Aap sabka meri zindagi mein hona mera saubhagya hai.'],
    ['ty', 'May Goddess Lakshmi bless our family with wealth, wisdom and wellbeing. May the lamps we light today brighten our path for years to come.',
      'माँ लक्ष्मी हमारे परिवार को धन, ज्ञान और स्वास्थ्य का आशीर्वाद दें। आज जो दीप हम जलाएँ, वे आने वाले वर्षों तक हमारा मार्ग रोशन करें।',
      'Maa Lakshmi humare parivar ko dhan, gyaan aur swasthya ka ashirwad dein. Aaj jo deep hum jalayein, woh aane wale varshon tak humara marg roshan karein.'],
    ['e', 'Home is wherever we all sit together with sweets, stories and diyas. Wishing every member of our family a warm, peaceful and joyful Diwali.',
      'घर वहीं है जहाँ हम सब मिठाई, किस्सों और दीयों के साथ बैठते हैं। हमारे परिवार के हर सदस्य को एक गर्म, शांत और आनंदमय दीपावली की शुभकामनाएँ।',
      'Ghar wahin hai jahan hum sab mithai, kisson aur diyon ke saath baithte hain. Humare parivar ke har sadasya ko ek warm, shaant aur anandmay Diwali ki shubhkamnayein.'],
    ['ye', 'May our family shine like a thousand golden lamps, bound by love and blessed with prosperity. Happy Diwali to the people who make my world feel royal.',
      'हमारा परिवार हज़ार सुनहरे दीपों की तरह दमके, प्रेम में बँधा रहे और समृद्धि से सम्पन्न हो। उन सबको शुभ दीपावली जो मेरी दुनिया को शाही बनाते हैं।',
      'Humara parivar hazaar sunehre deepon ki tarah damke, prem mein bandha rahe aur samriddhi se sampann ho. Un sabko Shubh Deepawali jo meri duniya ko shaahi banate hain.'],
    ['te', 'On this auspicious Diwali, may everyone\'s blessings and affection stay with us. May harmony, good health and happiness remain in our home all year.',
      'इस शुभ दीपावली पर सबका आशीर्वाद और स्नेह बना रहे। हमारे घर में सालभर प्रेम, अच्छी सेहत और ख़ुशहाली बनी रहे।',
      'Is shubh Diwali par sabka ashirwad aur sneh bana rahe. Humare ghar mein saalbhar prem, achhi sehat aur khushhali bani rahe.'],
  ],
  brother: [
    ['f', 'Happy Diwali to the brother who steals my sweets and my remote. Even so, I would choose you in every lifetime. May your year sparkle, bhai!',
      'उस भाई को दीपावली मुबारक, जो मेरी मिठाई भी चुराता है और रिमोट भी। फिर भी हर जन्म में भाई के रूप में तुम ही चाहिए। तुम्हारा साल जगमगाए, भाई!',
      'Us bhai ko Diwali mubarak, jo meri mithai bhi churata hai aur remote bhi. Phir bhi har janam mein bhai ke roop mein tum hi chahiye. Tumhara saal jagmagaye, bhai!'],
    ['e', 'You have always been my protector, my partner in mischief and my loudest supporter. This Diwali, I wish you success, strength and everything your heart desires.',
      'तुम हमेशा मेरे रक्षक, मेरी शरारतों के साथी और मेरे सबसे ज़ोरदार समर्थक रहे हो। इस दीपावली तुम्हें सफलता, शक्ति और वह सब मिले जो तुम्हारा दिल चाहता है।',
      'Tum hamesha mere rakshak, meri shararton ke saathi aur mere sabse zordaar supporter rahe ho. Is Diwali tumhe safalta, shakti aur woh sab mile jo tumhara dil chahta hai.'],
    ['ft', 'May your Diwali have more sweets than work, more lights than deadlines and more fireworks than fights with me. Happy Diwali, bhai!',
      'तुम्हारी दीपावली में काम से ज़्यादा मिठाई, डेडलाइन से ज़्यादा रोशनी और मुझसे झगड़ों से ज़्यादा पटाखे हों। शुभ दीपावली, भाई!',
      'Tumhari Diwali mein kaam se zyada mithai, deadline se zyada roshni aur mujhse jhagdon se zyada patakhe hon. Happy Diwali, bhai!'],
    ['te', 'Bhai, may Maa Lakshmi bless you with good health, success and happiness. Our home is brighter with you in it. Happy Diwali with all my love.',
      'भाई, माँ लक्ष्मी तुम्हें अच्छी सेहत, सफलता और ख़ुशियाँ दें। तुम्हारे होने से हमारा घर और भी रोशन है। ढेर सारे प्यार के साथ शुभ दीपावली।',
      'Bhai, Maa Lakshmi tumhe achhi sehat, safalta aur khushiyan dein. Tumhare hone se humara ghar aur bhi roshan hai. Dher saare pyaar ke saath Shubh Deepawali.'],
    ['fe', 'Fights, jokes, shared snacks and a lifetime of memories. That is us. Wishing you a Diwali that is at least as awesome as you think you are, bro!',
      'झगड़े, मज़ाक, मिलकर खाए स्नैक्स और ज़िंदगी भर की यादें। यही हम हैं। तुम्हारी दीपावली कम से कम उतनी शानदार हो जितना तुम खुद को समझते हो, भाई!',
      'Jhagde, mazaak, milkar khaye snacks aur zindagi bhar ki yaadein. Yahi hum hain. Tumhari Diwali kam se kam utni shaandaar ho jitna tum khud ko samajhte ho, bhai!'],
  ],
  sister: [
    ['e', 'You are my first friend and my forever safe place. May this Diwali shower you with as much love and light as you have given me.',
      'तुम मेरी पहली दोस्त और मेरी हमेशा की सुरक्षित जगह हो। यह दीपावली तुम्हें उतना ही प्यार और रोशनी दे जितना तुमने मुझे दिया है।',
      'Tum meri pehli dost aur meri hamesha ki safe jagah ho. Yeh Diwali tumhe utna hi pyaar aur roshni de jitna tumne mujhe diya hai.'],
    ['te', 'May Goddess Lakshmi bless my lovely sister with happiness, health and success. May every diya you light bring you closer to your dreams.',
      'देवी लक्ष्मी मेरी प्यारी बहन को ख़ुशियों, अच्छी सेहत और सफलता का आशीर्वाद दें। तुम्हारा जलाया हर दीया तुम्हें तुम्हारे सपनों के और क़रीब ले जाए।',
      'Devi Lakshmi meri pyaari behna ko khushiyon, achhi sehat aur safalta ka ashirwad dein. Tumhara jalaya har diya tumhe tumhare sapnon ke aur kareeb le jaye.'],
    ['f', 'Happy Diwali to the sister who borrowed my clothes, my charger and my secrets, and still gets the biggest hug. Love you, annoying habits included!',
      'उस बहन को दीपावली मुबारक जिसने मेरे कपड़े, चार्जर और राज़ उधार लिए, और फिर भी सबसे बड़ी झप्पी की हक़दार है। तुमसे बहुत प्यार, मेरी चिढ़ाने की आदतों समेत!',
      'Us behna ko Diwali mubarak jisne mere kapde, charger aur raaz udhaar liye, aur phir bhi sabse badi jhappi ki haqdaar hai. Tumse bohot pyaar, meri chidhane ki aadaton samet!'],
    ['et', 'Sister, your smile is my favourite decoration. May your home glow with joy, your heart with peace, and your life with every colour of rangoli.',
      'बहन, तुम्हारी मुस्कान मेरी सबसे पसंदीदा सजावट है। तुम्हारा घर ख़ुशी से, मन शांति से और जीवन रंगोली के हर रंग से जगमगाए।',
      'Behna, tumhari smile meri sabse pasandida sajawat hai. Tumhara ghar khushi se, mann shanti se aur jeevan rangoli ke har rang se jagmagaye.'],
    ['fe', 'May your Diwali sparkle like your sparklers and your sweets last longer than my patience. Always your partner in chaos. Happy Diwali, sis!',
      'तुम्हारी दीपावली तुम्हारी फुलझड़ियों जितनी चमके और मिठाइयाँ मेरे सब्र से ज़्यादा टिकें। हमेशा तुम्हारी हर गड़बड़ का साथी। शुभ दीपावली, बहना!',
      'Tumhari Diwali tumhari phuljhadiyon jitni chamke aur mithaiyan mere sabr se zyada tikein. Hamesha tumhari har gadbad ka saathi. Happy Diwali, behna!'],
  ],
  parents: [
    ['e', 'Everything I am today is because of your sacrifices and your love. Thank you for being my greatest blessing. May this Diwali fill your lives with joy and good health.',
      'आज मैं जो कुछ भी हूँ, वह आपके त्याग और प्यार की वजह से हूँ। मेरा सबसे बड़ा आशीर्वाद बनने के लिए धन्यवाद। यह दीपावली आपके जीवन को ख़ुशी और अच्छी सेहत से भर दे।',
      'Aaj main jo kuch bhi hoon, woh aapke tyaag aur pyaar ki wajah se hoon. Mera sabse bada ashirwad banne ke liye dhanyavaad. Yeh Diwali aapke jeevan ko khushi aur achhi sehat se bhar de.'],
    ['te', 'I seek your blessings this Diwali. May your love keep guiding me and may Goddess Lakshmi keep our home filled with peace and prosperity.',
      'इस दीपावली मुझे आपका आशीर्वाद चाहिए। आपका स्नेह मुझे राह दिखाता रहे और माँ लक्ष्मी हमारे घर को शांति और समृद्धि से भरती रहें।',
      'Is Diwali mujhe aapka ashirwad chahiye. Aapka sneh mujhe raah dikhata rahe aur Maa Lakshmi humare ghar ko shanti aur samriddhi se bharti rahein.'],
    ['yt', 'You are the pillars of my palace and the diyas of my destiny. May this Diwali crown you with happiness, honour and every blessing you have given me.',
      'आप मेरे जीवन के महल के स्तंभ और मेरी तक़दीर के दीपक हैं। यह दीपावली आपको ख़ुशी, सम्मान और वे सभी आशीर्वाद लौटाए जो आपने मुझे दिए हैं।',
      'Aap mere jeevan ke mahal ke stambh aur meri taqdeer ke deepak hain. Yeh Diwali aapko khushi, samman aur woh sabhi ashirwad lautaye jo aapne mujhe diye hain.'],
    ['et', 'Thank you for teaching me to light a diya even in the darkest times. Your strength inspires me every day. Wishing you a peaceful and blessed Diwali.',
      'सबसे अँधेरे वक़्त में भी दीया जलाना सिखाने के लिए धन्यवाद। आपकी हिम्मत मुझे हर दिन प्रेरित करती है। आपको शांतिपूर्ण और आशीर्वादों भरी दीपावली की शुभकामनाएँ।',
      'Sabse andhere waqt mein bhi diya jalana sikhane ke liye dhanyavaad. Aapki himmat mujhe har din prerit karti hai. Aapko shaantipoorn aur ashirwadon bhari Diwali ki shubhkamnayein.'],
    ['ye', 'May your lives glow like a thousand golden lamps. I pray for your health, your happiness and many more festivals together. Happy Diwali.',
      'आपका जीवन हज़ार सुनहरे दीपों की तरह जगमगाए। आपकी सेहत, ख़ुशी और साथ में आने वाले ढेरों त्योहारों की दुआ है। शुभ दीपावली।',
      'Aapka jeevan hazaar sunehre deepon ki tarah jagmagaye. Aapki sehat, khushi aur saath mein aane wale dher saare festivals ki dua hai. Shubh Deepawali.'],
  ],
  grandparents: [
    ['et', 'Your blessings are the brightest lamp in our home. May this Diwali bring you good health, peace and many more years of your gentle love.',
      'आपके आशीर्वाद हमारे घर का सबसे उजला दीपक हैं। यह दीपावली आपको अच्छी सेहत, शांति और स्नेह भरे अनेक वर्ष दे।',
      'Aapke ashirwad humare ghar ka sabse ujala deepak hain. Yeh Diwali aapko achhi sehat, shanti aur sneh bhare anek varsh de.'],
    ['te', 'I still remember the Diwali stories you told me and the sweets you made with so much love. Those memories glow brighter than any lamp. Pranam and happy Diwali.',
      'आपकी सुनाई दीपावली की कहानियाँ और प्यार से बनाई मिठाइयाँ मुझे आज भी याद हैं। वे यादें किसी भी दीपक से ज़्यादा रोशन हैं। चरण स्पर्श और शुभ दीपावली।',
      'Aapki sunayi Diwali ki kahaniyan aur pyaar se banayi mithaiyan mujhe aaj bhi yaad hain. Woh yaadein kisi bhi deepak se zyada roshan hain. Charan sparsh aur Shubh Deepawali.'],
    ['te', 'At this auspicious time, I bow at your feet. May Goddess Lakshmi keep you healthy and joyful, and may our family always stay under your loving shade.',
      'इस शुभ अवसर पर आपके चरणों में नमन। माँ लक्ष्मी आपको स्वस्थ और प्रसन्न रखें, और हमारा परिवार सदा आपकी स्नेहभरी छाया में रहे।',
      'Is shubh avsar par aapke charanon mein naman. Maa Lakshmi aapko swasth aur prasann rakhein, aur humara parivar sada aapki snehbhari chhaya mein rahe.'],
    ['e', 'You taught us that the real light of Diwali is love and togetherness. Thank you for holding our family together. Wishing you happiness and good health always.',
      'आपने सिखाया कि दीपावली की असली रोशनी प्रेम और साथ है। हमारे परिवार को जोड़े रखने के लिए धन्यवाद। आपको सदा ख़ुशी और अच्छी सेहत मिले।',
      'Aapne sikhaya ki Diwali ki asli roshni pyaar aur saath hai. Humare parivar ko jode rakhne ke liye dhanyavaad. Aapko sada khushi aur achhi sehat mile.'],
    ['te', 'May the glow of diyas bring warmth to your heart and a smile to your face. We are blessed to have you. Happy Diwali with respect and endless love.',
      'दीयों की रोशनी आपके मन को गर्माहट और चेहरे को मुस्कान दे। आप हमारे जीवन का सौभाग्य हैं। आदर और अनंत स्नेह के साथ शुभ दीपावली।',
      'Diyon ki roshni aapke mann ko garmaahat aur chehre ko muskaan de. Aap humare jeevan ka saubhagya hain. Aadar aur anant sneh ke saath Shubh Deepawali.'],
  ],
  teacher: [
    ['pt', 'Wishing you and your family a Diwali full of light, wisdom and happiness. Thank you for guiding us with such patience and dedication.',
      'आपको और आपके परिवार को प्रकाश, ज्ञान और ख़ुशियों से भरी दीपावली की शुभकामनाएँ। इतने धैर्य और समर्पण से मार्गदर्शन के लिए धन्यवाद।',
      'Aapko aur aapke parivar ko roshni, gyaan aur khushiyon se bhari Diwali ki shubhkamnayein. Itne dhairya aur samarpan se margdarshan ke liye dhanyavaad.'],
    ['ep', 'A good teacher lights a lamp that never goes out. Thank you for lighting mine. May this Diwali bring you peace, health and joy.',
      'एक अच्छा शिक्षक ऐसा दीप जलाता है जो कभी नहीं बुझता। मेरा दीप जलाने के लिए धन्यवाद। यह दीपावली आपको शांति, स्वास्थ्य और आनंद दे।',
      'Ek achha shikshak aisa deep jalata hai jo kabhi nahi bujhta. Mera deep jalane ke liye dhanyavaad. Yeh Diwali aapko shanti, swasthya aur anand de.'],
    ['tp', 'May the lights of Diwali brighten your life as your teachings have brightened ours. Happy Diwali and my sincere gratitude.',
      'जैसे आपकी शिक्षा ने हमारा जीवन रोशन किया है, वैसे ही दीपावली की रोशनी आपका जीवन आलोकित करे। शुभ दीपावली और हार्दिक आभार।',
      'Jaise aapki shiksha ne humara jeevan roshan kiya hai, waise hi Diwali ki roshni aapka jeevan alokit kare. Shubh Deepawali aur hardik aabhaar.'],
    ['pe', 'Your guidance has shaped my goals and my confidence. This Diwali, I wish you good health, happiness and the joy of seeing your students shine.',
      'आपके मार्गदर्शन ने मेरे लक्ष्यों और आत्मविश्वास को आकार दिया है। इस दीपावली आपको अच्छी सेहत, ख़ुशी और अपने विद्यार्थियों को चमकते देखने का आनंद मिले।',
      'Aapke margdarshan ne mere lakshyon aur aatmavishwas ko aakar diya hai. Is Diwali aapko achhi sehat, khushi aur apne vidyarthiyon ko chamakte dekhne ka anand mile.'],
    ['te', 'May this festival of lights remove every shadow of worry and bring you prosperity and peace. Thank you for being such an inspiring teacher.',
      'रोशनी का यह पर्व आपकी हर चिंता की छाया मिटाए और आपको समृद्धि व शांति दे। इतने प्रेरक शिक्षक होने के लिए धन्यवाद।',
      'Roshni ka yeh parv aapki har chinta ki chhaya mitaye aur aapko samriddhi va shanti de. Itne prerak shikshak hone ke liye dhanyavaad.'],
  ],
  colleagues: [
    ['p', 'Wishing you and your family a prosperous Diwali. May the coming year bring new opportunities, steady growth and well-earned success.',
      'आपको और आपके परिवार को समृद्ध दीपावली की शुभकामनाएँ। आने वाला वर्ष नए अवसर, निरंतर प्रगति और परिश्रम से अर्जित सफलता लाए।',
      'Aapko aur aapke parivar ko samriddh Diwali ki shubhkamnayein. Aane wala varsh naye avsar, nirantar pragati aur parishram se arjit safalta laye.'],
    ['pt', 'May the festival of lights fill your home with happiness and your career with clarity and achievement. Happy Diwali, and thank you for being a wonderful colleague.',
      'दीपावली का पर्व आपके घर में ख़ुशियाँ और करियर में स्पष्टता व उपलब्धियाँ लाए। शुभ दीपावली, और एक बेहतरीन सहकर्मी होने के लिए धन्यवाद।',
      'Deepawali ka parv aapke ghar mein khushiyan aur career mein spashtata va uplabdhiyan laye. Shubh Deepawali, aur ek behtareen sahkarmi hone ke liye dhanyavaad.'],
    ['yp', 'May your Diwali shine with the brilliance of a thousand lamps. Here is to a year of bold ideas, strong teamwork and remarkable results.',
      'आपकी दीपावली हज़ार दीपों की आभा से दमके। साहसिक विचारों, मज़बूत टीमवर्क और शानदार परिणामों से भरे वर्ष के लिए शुभकामनाएँ।',
      'Aapki Diwali hazaar deepon ki aabha se damke. Sahasik vicharon, mazboot teamwork aur shaandaar parinamon se bhare varsh ke liye shubhkamnayein.'],
    ['tp', 'On this auspicious occasion, may Goddess Lakshmi bless you with wealth, wisdom and wellbeing. Warm Diwali greetings to you and your loved ones.',
      'इस शुभ अवसर पर माँ लक्ष्मी आपको धन, ज्ञान और स्वास्थ्य का आशीर्वाद दें। आपको और आपके प्रियजनों को दीपावली की हार्दिक शुभकामनाएँ।',
      'Is shubh avsar par Maa Lakshmi aapko dhan, gyaan aur swasthya ka ashirwad dein. Aapko aur aapke priyajano ko Deepawali ki hardik shubhkamnayein.'],
    ['py', 'Wishing our whole team a Diwali that is bright, restful and rewarding. Enjoy time with family, recharge well and return with fresh energy and light.',
      'हमारी पूरी टीम को उजली, आरामदायक और सुखद दीपावली की शुभकामनाएँ। परिवार के साथ समय बिताएँ, अच्छी तरह तरोताज़ा हों और नई ऊर्जा के साथ लौटें।',
      'Humari poori team ko ujli, aaramdayak aur sukhad Diwali ki shubhkamnayein. Parivar ke saath samay bitayein, achhi tarah tarotaza hon aur nayi urja ke saath lautein.'],
  ],
  everyone: [
    ['et', 'May the light of Diwali fill your heart with hope, your home with joy and your life with love. Happy Diwali to you and everyone you hold dear.',
      'दीपावली की रोशनी आपके मन को आशा, घर को ख़ुशी और जीवन को प्रेम से भर दे। आपको और आपके सभी अपनों को शुभ दीपावली।',
      'Diwali ki roshni aapke mann ko asha, ghar ko khushi aur jeevan ko pyaar se bhar de. Aapko aur aapke sabhi apnon ko Shubh Deepawali.'],
    ['f', 'Wishing you a Diwali with more lights than power cuts, more sweets than diets and more smiles than notifications. Happy Diwali!',
      'आपकी दीपावली में बिजली कटौती से ज़्यादा रोशनी, डाइट से ज़्यादा मिठाई और नोटिफ़िकेशन से ज़्यादा मुस्कान हो। शुभ दीपावली!',
      'Aapki Diwali mein power cut se zyada roshni, diet se zyada mithai aur notifications se zyada muskaan ho. Happy Diwali!'],
    ['yt', 'May the golden glow of a thousand lamps crown your home with prosperity, your heart with peace and your days with endless good fortune. Happy Diwali!',
      'हज़ार दीपों की सुनहरी आभा आपके घर को समृद्धि, मन को शांति और आपके दिनों को अनंत सौभाग्य का ताज पहनाए। शुभ दीपावली!',
      'Hazaar deepon ki sunehri aabha aapke ghar ko samriddhi, mann ko shanti aur aapke dinon ko anant saubhagya ka taaj pehnaye. Shubh Deepawali!'],
    ['te', 'May Goddess Lakshmi and Lord Ganesha bless you with wealth, wisdom and well-being. Wishing you a bright and blessed Diwali.',
      'माँ लक्ष्मी और भगवान गणेश आपको धन, ज्ञान और स्वास्थ्य का आशीर्वाद दें। आपको उजली और शुभ दीपावली की शुभकामनाएँ।',
      'Maa Lakshmi aur Bhagwan Ganesh aapko dhan, gyaan aur swasthya ka ashirwad dein. Aapko ujli aur shubh Deepawali ki shubhkamnayein.'],
    ['p', 'Warm wishes for a joyful Diwali. May this festival bring you good health, steady prosperity and many moments of togetherness.',
      'आनंदमय दीपावली की हार्दिक शुभकामनाएँ। यह पर्व आपको अच्छी सेहत, स्थिर समृद्धि और अपनों के साथ बिताए अनेक पलों का उपहार दे।',
      'Anandmay Diwali ki hardik shubhkamnayein. Yeh parv aapko achhi sehat, sthir samriddhi aur apnon ke saath bitaye anek palon ka uphaar de.'],
    ['ft', 'May your Diwali be so bright that even the neighbours\' fairy lights feel jealous. Eat, laugh, repeat, and may the sweets be calorie-free just this once. Happy Diwali!',
      'आपकी दीपावली इतनी रोशन हो कि पड़ोसियों की झालरें भी जल उठें। खाइए, हँसिए, दोहराइए, और बस इस बार मिठाइयों में कैलोरी न हो। शुभ दीपावली!',
      'Aapki Diwali itni roshan ho ki padosiyon ki jhalrein bhi jal uthein. Khao, hanso, repeat karo, aur bas is baar mithaiyon mein calories na hon. Happy Diwali!'],
    ['yp', 'May this Diwali crown your efforts with success and your home with golden light. Wishing you grace, prosperity and a year of distinguished achievements.',
      'यह दीपावली आपके प्रयासों को सफलता और आपके घर को सुनहरी रोशनी का ताज पहनाए। आपको गरिमा, समृद्धि और उल्लेखनीय उपलब्धियों से भरा वर्ष मिले।',
      'Yeh Diwali aapke prayason ko safalta aur aapke ghar ko sunehri roshni ka taaj pehnaye. Aapko garima, samriddhi aur ullekhniya uplabdhiyon se bhara varsh mile.'],
    ['pe', 'Sending heartfelt Diwali greetings. May the festival renew your energy, strengthen your relationships and illuminate the path ahead.',
      'दीपावली की हार्दिक शुभकामनाएँ। यह पर्व आपकी ऊर्जा को नया करे, रिश्तों को मज़बूत बनाए और आगे के रास्ते को रोशन करे।',
      'Diwali ki hardik shubhkamnayein. Yeh parv aapki urja ko naya kare, rishton ko mazboot banaye aur aage ke raaste ko roshan kare.'],
  ],
};

/** Expanded, structured templates: { id, category, tones[], en, hi, hing } */
export const TEMPLATES = CATEGORIES.flatMap((cat) =>
  (RAW[cat.id] || []).map(([tags, en, hi, hing], i) => ({
    id: `${cat.id}-${i}`,
    category: cat.id,
    tones: [...tags].map((c) => TAG_TO_TONE[c]),
    en,
    hi,
    hing,
  }))
);

const BY_ID = new Map(TEMPLATES.map((t) => [t.id, t]));
const BY_CATEGORY = new Map(CATEGORIES.map((c) => [c.id, TEMPLATES.filter((t) => t.category === c.id)]));

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
export const getTemplate = (id) => BY_ID.get(id) || null;
export const getTemplatesFor = (categoryId) => BY_CATEGORY.get(categoryId) || [];

/** Tones this category can express (romantic only for crush / girlfriend / boyfriend). */
export function allowedTones(categoryId) {
  const set = new Set(getTemplatesFor(categoryId).flatMap((t) => t.tones));
  return TONES.filter((t) => set.has(t.id)).map((t) => t.id);
}

export function getPrefix(categoryId, language) {
  return PREFIX[getCategory(categoryId).prefix][language];
}
export function getSignoff(categoryId, language) {
  return SIGNOFF[getCategory(categoryId).signoff][language];
}
