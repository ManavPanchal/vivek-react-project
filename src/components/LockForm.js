import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ABI from '../ABI/ABI.json'
import Popup from './Popup'
import { AppContext } from '../App'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingLock from '../Animation/LandingLock'
import { validateForm } from '../util/util'
import SetTiming from './SetTiming'
const ethers = require("ethers")

const LockForm = () => {
    const contractAddress = '0x5444e45e8F82c9379B1843e77658AE1D6f2aC258';
    const { whitemod_flag, setWhitemodflag } = useContext(AppContext)
    const { WalletConnection, setWalletConnection } = useContext(AppContext)
    const [amount_error, setAmountError] = useState()
    const [slice_error, setSliceError] = useState('')
    const [beneficiaries_error, setBeneficiariesError] = useState('')
    const [cliff_error, setCliffError] = useState('')
    const [duration_error, setDurationError] = useState('')
    const [addressOfToken_error, setAddressTokenError] = useState('')
    const [form, setForm] = useState({})
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false)
    const [whiteListedToken, setData] = useState([])
    const [page, setPageComponent] = useState(true)
    const navigate = useNavigate();

    const style = {
        div_inner: whitemod_flag ? `min-h-fit min-w-fit bg-light_pink shadow-[rgba(0,_0,_0,_0.24)_0px_0px_5px] m-12 rounded-xl  ` : `min-h-fit min-w-fit bg-grey m-12 rounded-xl  `,
        title_text: `font-vesting text-pink text-3xl justify-self-start`,
        title_div: `flex m-6 pt-2 mb-0`,
        form_div: `m-11 mb-2`,
        input_form_div: `flex justify-center min-w-fit `,
        btn_lock: `bg-pink font-vesting rounded-full px-6 mb-10 h-10 box-border  `,
        input_field: whitemod_flag ? `bg-white_text  rounded font-form mb-2 w-full h-8 p-2` : `bg-dim_black text-white_text rounded font-form mb-2 w-full h-10 p-2`,
        input_field_dd: whitemod_flag ? `  rounded font-form mb-2 w-full h-8  relative w-full` : `relative w-full text-white_text rounded font-form mb-2 w-full h-8`,
        input_label: whitemod_flag ? `font-form text-dim_black justify-self-start mt-2 text-xl` : `font-form text-white justify-self-start mt-2 text-xl`,
        input_form_div_left: `flex flex-col items-start rounded-xl m-2 p-7 w-full`,
        input_form_div_left_child: `flex flex-col items-start rounded-xl  p-7 w-full border-pink border-solid border-2`,
        network_div: `rounded-xl bg-white_text h-12 w-full  mx-9 flex items-center pl-4`,
        formValidationError: `mb-8 text-red h-6 text-xs text-left`,
        select_dd: whitemod_flag ? `w-full p-2 text-dim_black bg-white_text rounded font-form outline-none h-10 appearance-none` : `w-full h-10 font-form p-2 text-white bg-dim_black rounded  outline-none appearance-none `
    }

    useEffect(() => {

        //dropdown setup data
        async function SetDropdown() {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const wallet_add = await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, ABI, signer);
            const whiteList = [];
            const len_whitelist = parseInt(await contract.getTotalWhitelist());

            for (let i = 0; i < len_whitelist; i++) {
                const tokenContractAddress = await contract.WhiteListTokens(i)
                let Tokencontract = null;
                if (provider.provider.networkVersion == 80001)
                    Tokencontract = await fetch(`https://api-testnet.polygonscan.com/api?module=contract&action=getabi&address=${tokenContractAddress}&apikey=6Z536YUCYRCIDW1CR53QAS1PYZ41X2FA7K`)
                else if (provider.provider.networkVersion == 11155111)
                    Tokencontract = await fetch(`https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${tokenContractAddress}&apikey=WSG13CQU7C9GAHQIRH3J51BPRDYDSC835B`)
                const respo = await Tokencontract.json()
                const Tcontract = new ethers.Contract(tokenContractAddress, respo.result, signer);
                const name = await Tcontract.name()
                const symbol = await Tcontract.symbol()
                whiteList.push({ C_address: tokenContractAddress, C_name: `${name} (${symbol}) - ${tokenContractAddress}` });
            }
            setData(whiteList)
        }
        SetDropdown()
    }, [])
    console.log(form.slice);
    async function SetupForm() {

        const amount = form.amount;
        const duration = form.duration;
        console.log(duration);
        const slice = form.slice;
        const cliff = form.cliff;
        const Beneficiaries = form.Beneficiaries;
        const addressoftoken = form.address_of_token
        if (validateForm(form)) {
            console.log("yes valid")

            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const wallet_add = await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();

                let ABI_Token = null;
                console.log(addressoftoken);
                if (provider.provider.networkVersion == 80001)
                    ABI_Token = await fetch(`https://api-testnet.polygonscan.com/api?module=contract&action=getabi&address=${addressoftoken}&apikey=6Z536YUCYRCIDW1CR53QAS1PYZ41X2FA7K`)
                else if (provider.provider.networkVersion == 11155111)
                    ABI_Token = await fetch(`https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${addressoftoken}&apikey=WSG13CQU7C9GAHQIRH3J51BPRDYDSC835B`)
                const response = await ABI_Token.json()
                const Tokencontract = new ethers.Contract(addressoftoken, response.result, signer);
                const tx_allowance = await Tokencontract.allowance(wallet_add[0], contractAddress)
                const allowance = parseInt(tx_allowance);
                if (allowance < amount) {
                    const tx_approve = await Tokencontract.approve(contractAddress, amount)

                }
                // await lockToken(amount, duration, slice, cliff, Beneficiaries, addressoftoken);
                // navigate("/currentVesting")
            }
            catch (e) {
                console.log(e)
            }
        }
        else console.log("not valid");
    }

    function validateForm(form) {
        const num_regex = /^[0-9]+$/
        const beneficiaries_regex = /^0x[a-fA-F0-9]{40}$/
        const addressOFToken_regex = /^0x[0-9a-fA-F]{40}$/

        const amount_result = (num_regex.test(form.amount)) && (form.amount > 0);
        (!amount_result) ? setAmountError(' * Amount Field contain only digit 0-9, no any other symbol and character. It must be greater than 0(zero)') : setAmountError('')
        const slice_result = (num_regex.test(form.slice)) && (form.slice > 0);
        (!slice_result) ? setSliceError('* Slice Period only contains digit 0-9. It must be greater than 0(Zero)') : setSliceError('')
        const cliff_result = (num_regex.test(form.cliff));
        (!cliff_result) ? setCliffError(' * Cliff contains only digit 0-9. No any other characters are accepted') : setCliffError('')
        const beneficiearies_result = beneficiaries_regex.test(form.Beneficiaries);
        (!beneficiearies_result) ? setBeneficiariesError('*  Enter a valid address of Beneficiaries.') : setBeneficiariesError('')
        const addressOfToken_result = addressOFToken_regex.test(form.address_of_token);
        (!addressOfToken_result) ? setAddressTokenError(' * Please enter valid Address Of Token.') : setAddressTokenError('')
        const duration_result = num_regex.test(form.duration);
        (!duration_result) ? setDurationError('Duration contains only digit 0-9. Enter Valid Duration.') : setDurationError('')
        return (amount_result && slice_result && cliff_result && beneficiearies_result && addressOfToken_result && duration_result)
    }
    const lockToken = async (amount, duration, slice, cliff, Beneficiaries, addressoftoken) => {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const acc = await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, ABI, signer);
            const locked = await contract.lock(amount, duration, slice, cliff, Beneficiaries, addressoftoken);
            setLoading(true)
            await locked.wait()
            setLoading(false)
            toast.success('Transaction successful', {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: whitemod_flag ? "light" : "dark",
            })
        }
        catch (e) {
            ((e.toString()).includes('user rejected transaction'))
                ?
                toast.error('User Reject Transaction', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: whitemod_flag ? "light" : "dark",
                })
                :
                console.log(e)
        }
    }
    function next() {
        SetupForm()
        // if (!page)
        //     setPageComponent(true)
        // else
        setPageComponent(false)
    }
    return (

        <div className={style.div_inner}>
            {WalletConnection
                ?
                (loading
                    ?
                    <LandingLock />
                    :
                    <>
                        <div className={style.title_div}>
                            <p className={style.title_text}>New Vesting</p>
                        </div>
                        <div className={style.form_div}>
                            {page ? <>
                                <div className={style.input_form_div}>
                                    <div className={style.input_form_div_left}>

                                        <p className={style.input_label}>Token</p>
                                        <div className={style.input_field_dd}>
                                            <select className={style.select_dd} onChange={(event) => { setForm({ ...form, address_of_token: event.target.value }) }}>
                                                <option>Select Token</option>
                                                {whiteListedToken
                                                    &&
                                                    whiteListedToken.map((e, index) => {
                                                        return (
                                                            <>
                                                                <option value={e.C_address}>{e.C_name}</option>
                                                            </>
                                                        )
                                                    })
                                                }
                                            </select>
                                        </div>
                                        <span className={style.formValidationError}>{addressOfToken_error}</span>

                                        <p className={style.input_label}>Amount</p>
                                        <input type='number' placeholder='Enter amount here' required className={style.input_field} onChange={(event) => { setForm({ ...form, amount: event.target.value }) }} />
                                        <span className={style.formValidationError}>{amount_error}</span>


                                    </div>

                                    <div className={style.input_form_div_left}>

                                        <p className={style.input_label}>Slice Period</p>
                                        <div className={whitemod_flag ? 'w-full flex h-10 bg-white_text rounded' : 'w-full flex h-10 bg-dim_black rounded'}>

                                            <select className={style.select_dd + `w-1/4 bg-transparent`} onChange={(event) => { setForm({ ...form, slice_unit: event.target.value }) }}>
                                                <option>-- per -- </option>
                                                <option value={1}>Per Second</option>
                                                <option value={60}>Per Minute</option>
                                                <option value={3600} >Per Hour</option>
                                                <option value={86400} >Per Day</option>
                                            </select>
                                            <input type='number' placeholder='Enter Slice Period ' required className={style.input_field + `w-3/4 pl-2 bg-transparent`} onChange={(event) => { setForm({ ...form, slice: (event.target.value) * form.slice_unit }) }} />
                                        </div>
                                        <span className={style.formValidationError}>{slice_error}</span>

                                        <p className={style.input_label}>Beneficiaries</p>
                                        <input type='text' placeholder='Enter Beneficiaries address here' className={style.input_field} onChange={(event) => { setForm({ ...form, Beneficiaries: event.target.value }) }} />
                                        <span className={style.formValidationError}>{beneficiaries_error}</span>



                                        {/* <p className={style.input_label}>Beneficiaries</p>
                                        <input type='text' placeholder='Enter Beneficiaries address here' className={style.input_field} onChange={(event) => { setForm({ ...form, Beneficiaries: event.target.value }) }} />
                                        <span className={style.formValidationError}>{beneficiaries_error}</span> */}

                                    </div>
                                </div>
                                <div>
                                    <button className={style.btn_lock} onClick={next}>Next</button>
                                </div></>
                                : <SetTiming half_form_send={form} />}
                        </div>
                    </>
                )
                :
                <Popup />
            }
        </div>
    )
}

export default LockForm