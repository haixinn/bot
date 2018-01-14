const { Wechaty, Room, Contact, MediaMessage } = require('wechaty')
const QrcodeTerminal = require('qrcode-terminal')
const https = require('https')
const querystring = require('querystring');
const path = require('path');

const MAX_CONTACT_HAILUO = 1800
const bot = Wechaty.instance()
bot.on('scan', (url, code) => {
    const loginUrl = url.replace(/\/qrcode\//, '/l/')
    if (!/201|200/.test(String(code))) {
        QrcodeTerminal.generate(loginUrl)
    }
    if (code == 0 || code == 408) {

        const postData = querystring.stringify({
            'text': '请扫描二维码登录~',
            'desp': `![](${url})`,
        });

        const options = {
            hostname: 'sc.ftqq.com',
            path: '/SCU19417Tfbe788f1a1ca27142d925adfb11d75fb5a4da8a8cf4f9.send',
            port: '',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            }
        };
        const req = https.request(options);
        req.write(postData);
        req.end();
    }
})

    .on('login', async user => {
        console.log(`${user} 登录成功`)
    })

    .on('logout', user => {
        console.log(`${user} 退出登录`)
    })

    .on('friend', async (contact, request) => {
        if (request) {
            await request.accept()
            await contact.say(``)
            await contact.say(new MediaMessage(__dirname + '/wechaty.jpeg'))
            console.log(`Contact: ${contact.name()} send request ${request.hello}`)
        }
    })

    .on('message', async m => {
        try {
            const sender = m.from()
            const content = m.content()
            const room = m.room()
            if (m.self()) return
            if (!room) {
                if (m.type() === 10000) return
                if (m.type() === 1) {
                    await m.say(``)
                    await m.say(new MediaMessage(__dirname + '/wechaty.jpeg'))
                }
                if (m.type() === 3 && !sender.official() && !sender.special() && sender.personal()) {
                    const findRoom = await Room.find({ topic: "全民读书挑战赛" })
                    // const hasContact = await findRoom.has(sender)
                    // if (hasContact) {
                    //     m.say('你已经在群里了')
                    // }
                    if (findRoom) {
                        findRoom.add(sender)
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
    })

    // .on('room-join', async (room, inviteeList, inviter) => {
    //     const inviteeName = inviteeList.map(c => c.name()).join(', ')
    //     const inviterIsMyself = inviter.self()

    //     if (room.topic() !== "全民读书挑战赛" || inviterIsMyself) return
    //     await room.say('请勿私自拉人。需要拉人请加我', inviter)
    //     await room.say('请先加我好友，然后我来拉你入群。先把你移出啦。', inviteeList)

    //     inviteeList.forEach(c => {
    //         room.del(c)
    //     })
    // })

    .start()
    .catch(e => {
        console.log('错了')
    })

async function getContactList() {
    const contactList = await Contact.findAll()

    console.log('Bot', '#######################')
    console.log('Bot', contactList.length)

    if (contactList.length < MAX_CONTACT_HAILUO) {
        setTimeout(getContactList, 5000)
        return
    }
    for (let i = 0; i < contactList.length; i++) {
        const contact = contactList[i]

        if (!contact.weixin()) {
            await contact.refresh()
        }
        console.log(`Bot ${i}`, contact.name())
    }
}