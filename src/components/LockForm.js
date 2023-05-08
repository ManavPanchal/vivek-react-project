import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ethLogo from '../images/ethLogo.png'
import polygonLogo from '../images/polygonLogo.png'
import ABI from './ABI.json'
const ethers = require("ethers")

const LockForm = () => {
    const style = {
        div_inner: `min-h-fit min-w-fit bg-grey m-12 rounded-xl  `,
        title_text: `font-vesting text-pink text-3xl justify-self-start`,
        title_div: `flex m-6`,
        form_div: `m-11`,
        input_form_div: `flex justify-center min-w-fit `,
        btn_lock: `bg-pink font-vesting rounded-full px-6 mb-10 h-10 box-border  `,
        input_field: `bg-white_text rounded font-form mb-10 w-full h-8 p-2`,
        input_label: `font-form text-white_text justify-self-start mt-2 text-xl`,
        input_form_div_left: `flex flex-col items-start rounded-xl m-7 p-7 w-full`,
        network_div: `rounded-xl bg-white_text h-12 w-full  mx-9 flex items-center pl-4`,
        cmp_network: `px-11`,
        networkLogo: `max-h-8 px-4`,
        network_name: `font-form pl-2 `
    }
    const [form, setForm] = useState({})
    const [inputValue, setInputValue] = useState('');
    const navigate = useNavigate();
    const contractAddress = '0x5444e45e8F82c9379B1843e77658AE1D6f2aC258';

    async function view() {

        const amount = form.amount;
        const duration = form.duration;
        const slice = form.slice;
        const cliff = form.cliff;
        const Beneficiaries = form.Beneficiaries;
        const addressoftoken = form.address_of_token
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const wallet_add = await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            let deme = null;
            if (provider.provider.networkVersion == 80001)
                deme = await fetch(`https://api-testnet.polygonscan.com/api?module=contract&action=getabi&address=${addressoftoken}&apikey=6Z536YUCYRCIDW1CR53QAS1PYZ41X2FA7K`)
            else if (provider.provider.networkVersion == 11155111)
                deme = await fetch(`https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${addressoftoken}&apikey=WSG13CQU7C9GAHQIRH3J51BPRDYDSC835B`)
            const respo = await deme.json()
            const Tcontract = new ethers.Contract(addressoftoken, respo.result, signer);
            const tx_allowance = await Tcontract.allowance(wallet_add[0], contractAddress)
            const allowance = parseInt(tx_allowance);
            if (allowance < amount) {
                const tx_approve = await Tcontract.approve(contractAddress, amount)

            }

            await lockToken(amount, duration, slice, cliff, Beneficiaries, addressoftoken);
            navigate("/currentVesting")
        }
        catch (e) {
            console.log(e)
        }
    }

    const lockToken = async (amount, duration, slice, cliff, Beneficiaries, addressoftoken) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const acc = await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, ABI, signer);
        const locked = await contract.lock(amount, duration, slice, cliff, Beneficiaries, addressoftoken);
    }
    return (

        <div className={style.div_inner}>
            <div className={style.title_div}>
                <p className={style.title_text}>New Vesting</p>
            </div>
            <div className={style.form_div}>
                <div className={style.input_form_div}>
                    <div className={style.input_form_div_left}>
                        <p className={style.input_label}>Amount</p>
                        <input type='number' className={style.input_field} onChange={(event) => { setForm({ ...form, amount: event.target.value }) }} />
                        <p className={style.input_label}>Slice Period</p>
                        <input type='number' className={style.input_field} onChange={(event) => { setForm({ ...form, slice: event.target.value }) }} />
                        <p className={style.input_label}>Beneficiaries</p>
                        <input type='text' className={style.input_field} onChange={(event) => { setForm({ ...form, Beneficiaries: event.target.value }) }} />
                    </div>
                    <div className={style.input_form_div_left}>
                        <p className={style.input_label}>Duration</p>
                        <input type='number' className={style.input_field} onChange={(event) => { setForm({ ...form, duration: event.target.value }) }} />
                        <p className={style.input_label}>Cliff</p>
                        <input type='number' className={style.input_field} onChange={(event) => { setForm({ ...form, cliff: event.target.value }) }} />
                        <p className={style.input_label}>Address Of Token</p>
                        <input type='text' className={style.input_field} onChange={(event) => { setForm({ ...form, address_of_token: event.target.value }) }} />
                    </div>
                </div>

            </div>
            <div>
                <button className={style.btn_lock} onClick={view}>Lock Tocken</button>
            </div>
        </div>
    )
}

export default LockForm