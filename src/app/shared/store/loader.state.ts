import { Action, Selector, State, StateContext } from '@ngxs/store';
import { HideLoaderAction, ShowLoaderAction } from './loader.actions';

export class LoaderStateModel {
  public status: boolean;
}

@State<LoaderStateModel>({
  name: 'loader',
  defaults: {
    status: false,
  },
})
export class LoaderState {
  @Selector()
  public static status(state: LoaderStateModel) {
    return state.status;
  }

  @Action(ShowLoaderAction)
  public showLoaderAction(ctx: StateContext<LoaderStateModel>) {
    ctx.setState({ status: true });
  }

  @Action(HideLoaderAction)
  public hideLoaderAction(ctx: StateContext<LoaderStateModel>) {
    ctx.setState({ status: false });
  }
}
