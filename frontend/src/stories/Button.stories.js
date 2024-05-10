import { Button } from '../components/index'
import '../index.css'
import '@fontsource-variable/montserrat'

export default {
  component: Button,
}

export const Primary = {
  args: {
    children: 'Submit New Pickup Data',
    size: 'default',
  },
}

export const Small = {
  args: {
    children: 'Submit New Pickup Data',
    size: 'small',
  },
}
